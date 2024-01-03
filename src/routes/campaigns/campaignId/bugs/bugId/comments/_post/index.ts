/** OPENAPI-CLASS: post-campaigns-cid-bugs-bid-comments */
import BugsRoute from "@src/features/routes/BugRoute";
import { tryber, unguess } from "@src/features/database";
import { formatInTimeZone, zonedTimeToUtc } from "date-fns-tz";
import { formatISO } from "date-fns";
import { sendTemplate } from "@src/features/mail/sendTemplate";

const MAX_COMMENT_PREVIEW_LENGTH = 80;

export default class Route extends BugsRoute<{
  parameters: StoplightOperations["post-campaigns-cid-bugs-bid-comments"]["parameters"]["path"];
  body: StoplightOperations["post-campaigns-cid-bugs-bid-comments"]["requestBody"]["content"]["application/json"];
  response: StoplightOperations["post-campaigns-cid-bugs-bid-comments"]["responses"]["200"]["content"]["application/json"];
}> {
  private cid: number;
  private bid: number;
  private author: { id: number; name: string } | undefined;
  private comment: string | undefined;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    const params = this.getParameters();

    this.cid = parseInt(params.cid);
    this.bid = parseInt(params.bid);
    this.comment = this.getBody().text;
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
      };
    }

    const author = await tryber.tables.WpAppqEvdProfile.do()
      .select("id", "name", "surname")
      .where("id", profileId)
      .first();

    if (!author) throw "author not found";

    const surname = author.surname
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + ".")
      .join(" ");

    return {
      id: author.id,
      name: `${author.name} ${surname}`,
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
      creator: {
        id: this.author.id,
        name: this.author.name,
      },
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
      .andWhere("profile_id", "!=", this.getProfileId());

    if (!comments.length) return [];

    const recipients = await tryber.tables.WpAppqEvdProfile.do()
      .select("name", "surname", "email")
      .whereIn(
        "id",
        comments.map((c) => c.profile_id)
      );

    return recipients;
  }

  private async getBugData() {
    return await tryber.tables.WpAppqEvdBug.do()
      .select("id", "internal_id", "message")
      .where("id", this.bid)
      .first();
  }

  private getCommentPreview() {
    if (!this.comment) return false;
    if (this.comment.length <= MAX_COMMENT_PREVIEW_LENGTH) return this.comment;

    return this.comment.substr(0, MAX_COMMENT_PREVIEW_LENGTH) + "...";
  }

  private async sendEmail() {
    const bug = await this.getBugData();

    const recipients = await this.getRecipients();
    if (!recipients.length) return false;

    await sendTemplate({
      template: "notify_campaign_bug_comment",
      email: recipients.map((r) => r.email),
      subject: "Nuovo commento sul bug",
      categories: [`CP${this.cid}_BUG_COMMENT_NOTIFICATION`],
      optionalFields: {
        "{Author.name}": this.author?.name || "Name S.",
        "{Bug.id}": this.bid,
        "{Bug.title}": bug?.message,
        "{Comment}": this.getCommentPreview(),
        "{Campaign.title}": this.campaignName,
        "{Bug.url}": `${process.env.APP_URL}/campaigns/${this.cid}/bugs/${this.bid}`,
      },
    });
  }
}
