/** OPENAPI-CLASS: post-campaigns-cid-bugs-bid-comments */
import BugsRoute from "@src/features/routes/BugRoute";
import { tryber, unguess } from "@src/features/database";
import { formatInTimeZone, zonedTimeToUtc } from "date-fns-tz";
import { formatISO } from "date-fns";
import { getTemplate } from "@src/features/mail/getTemplate";
import { isInternal } from "@src/utils/users/isInternal";
import { defaultProvider } from "@aws-sdk/credential-provider-node";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";
import { URL } from "url";
import axios from "axios";
import { buildNotificationEmail } from "@src/features/mail/buildEmailNotification";
import config from "@src/config";

const MAX_COMMENT_PREVIEW_LENGTH = 80;

export default class Route extends BugsRoute<{
  parameters: StoplightOperations["post-campaigns-cid-bugs-bid-comments"]["parameters"]["path"];
  body: StoplightOperations["post-campaigns-cid-bugs-bid-comments"]["requestBody"]["content"]["application/json"];
  response: StoplightOperations["post-campaigns-cid-bugs-bid-comments"]["responses"]["200"]["content"]["application/json"];
}> {
  private cid: number;
  private bid: number;
  private author: StoplightComponents["schemas"]["BugComment"]["creator"] = {
    id: 0,
    name: "Name S.",
    isInternal: false,
  };
  private comment: string | undefined;
  private mentioned: StoplightOperations["post-campaigns-cid-bugs-bid-comments"]["requestBody"]["content"]["application/json"]["mentioned"];

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    const params = this.getParameters();

    this.cid = parseInt(params.cid);
    this.bid = parseInt(params.bid);
    this.comment = this.getBody().text;
    this.mentioned = this.getBody().mentioned || [];
  }

  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) {
      this.setError(403, { message: "Something went wrong!" } as OpenapiError);
      return false;
    }

    if (!this.comment) {
      this.setError(400, { message: "Something went wrong!" } as OpenapiError);
      return false;
    }

    if (!this.shouldShowThisBug()) {
      this.setError(400, {
        status_code: 400,
        name: "bugs",
        message: "You don't have access to this bug",
      });
      return false;
    }

    return true;
  }

  protected async prepare(): Promise<void> {
    try {
      this.author = await this.getAuthor();
      const commentId = await this.addComment();
      if (!commentId) {
        this.setError(400, {
          message: "Something went wrong, cannot addComment!",
        } as OpenapiError);
        return;
      }
      const comment = await this.getComment(commentId);

      if (!comment) {
        this.setError(400, {
          message: "Something went wrong, cannot getComment!!",
        } as OpenapiError);
        return;
      }

      return this.setSuccess(200, {
        id: comment.id,
        text: comment.text,
        creation_date: comment.creation_date_utc,
        creator: comment.creator,
      });
    } catch (error) {
      switch (error) {
        case "NOT_FOUND":
          return this.setError(403, {} as OpenapiError);
        default:
          return this.setError(500, {
            message: "Something went wrong!",
          } as OpenapiError);
      }
    }
  }

  private async getAuthor() {
    const profileId = this.getProfileId();
    if (profileId === 0) {
      return {
        id: 0,
        name: "Name S.",
        isInternal: true,
      };
    }

    const author = await tryber.tables.WpAppqEvdProfile.do()
      .select("id", "name", "surname", "email")
      .where("id", profileId)
      .first();

    if (!author) throw "Author not found";

    const surname = author.surname
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + ".")
      .join(" ");

    return {
      id: author.id,
      name: `${author.name} ${surname}`,
      isInternal: isInternal(author.email),
    };
  }

  private async getComment(id: number) {
    const comment = await unguess.tables.UgBugsComments.do()
      .select("id", "text", "creation_date_utc", "profile_id")
      .where("id", id)
      .first();

    if (!comment || !this.author) return null;

    return {
      id: comment.id,
      text: comment.text,
      creation_date_utc: formatISO(
        zonedTimeToUtc(comment.creation_date_utc, "UTC")
      ),
      creator: this.author,
    };
  }

  private async addComment() {
    const comment = await unguess.tables.UgBugsComments.do()
      .insert({
        text: this.comment,
        bug_id: this.bid,
        profile_id: this.getProfileId(),
        creation_date_utc: formatInTimeZone(
          new Date(),
          "UTC",
          "yyyy-MM-dd HH:mm:ss"
        ),
      })
      .returning("id");
    const commentId = comment[0].id ?? comment[0];
    if (commentId) {
      await this.sendEmail();
      return commentId;
    }

    return false;
  }

  private async getRecipients() {
    const comments = await unguess.tables.UgBugsComments.do()
      .select(unguess.ref("profile_id").withSchema("ug_bugs_comments"))
      .where("bug_id", this.bid)
      .andWhere("is_deleted", 0)
      .andWhere("profile_id", "!=", this.getProfileId());

    if (!comments.length) return [];

    const recipients = await tryber.tables.WpAppqEvdProfile.do()
      .select("id", "name", "surname", "email")
      .whereIn(
        "id",
        comments.map((c) => c.profile_id)
      );

    return recipients;
  }

  private async getMentioned() {
    if (!this.mentioned || !this.mentioned.length) return [];

    const mentions = await tryber.tables.WpAppqEvdProfile.do()
      .select("id", "name", "surname", "email")
      .whereIn(
        "id",
        this.mentioned.map((m) => m.id)
      );

    return mentions;
  }

  private async getBugData() {
    return await tryber.tables.WpAppqEvdBug.do()
      .select("id", "internal_id", "message")
      .where("id", this.bid)
      .first();
  }

  private getCommentPreview() {
    if (!this.comment) return false;

    // Remove HTML tags
    const clean = this.comment.replace(/(<([^>]+)>)/gi, "");

    if (clean.length <= MAX_COMMENT_PREVIEW_LENGTH) return clean;

    return clean.substr(0, MAX_COMMENT_PREVIEW_LENGTH) + "...";
  }

  private async sendEmail() {
    const bug = await this.getBugData();
    const recipients = await this.getRecipients();
    const mentioned = await this.getMentioned();
    const filteredRecipients = recipients.filter(
      (r) => !mentioned.find((m) => m.id === r.id)
    );

    // Setup notification service
    const rest_api_id = process.env.NOTIFICATION_SERVICE_REST_API_ID || "";
    const region = process.env.AWS_REGION || "eu-west-1";

    const url = `https://${rest_api_id}.execute-api.${region}.amazonaws.com/v1/notifications`;
    const apiEndpoint = new URL(url);

    const signer = new SignatureV4({
      service: "execute-api",
      region: process.env.AWS_REGION ?? "eu-west-1",
      credentials: defaultProvider(),
      sha256: Sha256,
    });

    if (recipients.length) {
      const commentEmailHtml = await getTemplate({
        template: "notify_campaign_bug_comment",
        email: filteredRecipients.map((r) => r.email),
        subject: "Nuovo commento sul bug",
        categories: [`CP${this.cid}_BUG_COMMENT_NOTIFICATION`],
        optionalFields: {
          "{Author.name}": this.author?.name || "Name S.",
          "{Bug.id}": this.bid,
          "{Bug.title}": bug?.message,
          "{Comment}": this.getCommentPreview(),
          "{Campaign.title}": this.campaignName,
          "{Bug.url}": `${config.APP_URL}campaigns/${this.cid}/bugs/${this.bid}`,
        },
      });

      const notificationComment = buildNotificationEmail({
        entity_id: this.bid.toString(),
        entity_name: "BUG",
        subject: "Nuovo commento sul bug",
        html: commentEmailHtml,
        to: await Promise.all(
          recipients.map(async (r) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            notify: await this.getUserNotificationPreferences(r.id),
          }))
        ),
        cc: [],
        notification_type: "BUG_COMMENT",
      });

      const requestComment = new HttpRequest({
        method: "POST",
        hostname: apiEndpoint.host,
        protocol: apiEndpoint.protocol,
        path: apiEndpoint.pathname,
        headers: {
          host: apiEndpoint.hostname,
        },
        body: JSON.stringify(notificationComment),
      });

      const { headers: headersCommentRequest, body: bodyCommentRequest } =
        await signer.sign(requestComment);

      await axios
        .post(url, bodyCommentRequest, {
          headers: headersCommentRequest,
        })
        .catch((error) => {
          console.error("API Gateway error:", error);
          throw error;
        });
    }

    if (mentioned.length) {
      const mentionEmailHtml = await getTemplate({
        template: "notify_campaign_bug_comment_mention",
        email: mentioned.map((r) => r.email),
        subject: "Sei stato menzionato in un commento",
        categories: [`CP${this.cid}_BUG_COMMENT_MENTION_NOTIFICATION`],
        optionalFields: {
          "{Author.name}": this.author?.name || "Name S.",
          "{Bug.id}": this.bid,
          "{Bug.title}": bug?.message,
          "{Comment}": this.getCommentPreview(),
          "{Campaign.title}": this.campaignName,
          "{Bug.url}": `${config.APP_URL}campaigns/${this.cid}/bugs/${this.bid}`,
        },
      });

      const notificationMention = buildNotificationEmail({
        entity_id: this.bid.toString(),
        entity_name: "BUG",
        subject: "Sei stato menzionato in un commento",
        html: mentionEmailHtml,
        to: mentioned.map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          notify: true,
        })),
        cc: [],
        notification_type: "BUG_COMMENT_MENTION",
      });

      const requestMention = new HttpRequest({
        method: "POST",
        hostname: apiEndpoint.host,
        protocol: apiEndpoint.protocol,
        path: apiEndpoint.pathname,
        headers: {
          host: apiEndpoint.hostname,
        },
        body: JSON.stringify(notificationMention),
      });

      const { headers: headersMentionRequest, body: bodyMentionRequest } =
        await signer.sign(requestMention);

      await axios
        .post(url, bodyMentionRequest, {
          headers: headersMentionRequest,
        })
        .then()
        .catch((error) => {
          console.error("API Gateway error:", error);
          throw error;
        });
    }
  }

  private async getUserNotificationPreferences(profileId: number) {
    const userPrefs = await unguess.tables.Preferences.do()
      .select(
        "preferences.id as preference_id",
        "preferences.name",
        unguess.raw(
          "COALESCE(user_preferences.value, preferences.default_value) as value"
        )
      )
      .leftJoin("user_preferences", function () {
        this.on("preferences.id", "=", "user_preferences.preference_id").andOn(
          "user_preferences.profile_id",
          "=",
          unguess.raw("?", [profileId])
        );
      })
      .join("preferences as default_prefs", function () {
        this.on("default_prefs.id", "=", "preferences.id");
      })
      .where("preferences.is_active", 1)
      .andWhere("preferences.name", "notifications_enable");

    let notify = true;
    if (userPrefs && userPrefs.length > 0) {
      if (!userPrefs[0].value) notify = false;
    }

    return notify;
  }
}
