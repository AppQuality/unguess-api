/** OPENAPI-CLASS: post-campaigns-cid-bugs-bid-comments */
import BugsRoute from "@src/features/routes/BugRoute";
import { tryber, unguess } from "@src/features/database";
import { formatInTimeZone, zonedTimeToUtc } from "date-fns-tz";
import { formatISO } from "date-fns";
import sgMail from "@sendgrid/mail";

export default class Route extends BugsRoute<{
  parameters: StoplightOperations["post-campaigns-cid-bugs-bid-comments"]["parameters"]["path"];
  body: StoplightOperations["post-campaigns-cid-bugs-bid-comments"]["requestBody"]["content"]["application/json"];
  response: StoplightOperations["post-campaigns-cid-bugs-bid-comments"]["responses"]["200"]["content"]["application/json"];
}> {
  private cid: number;
  private bid: number;
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
      const commentId = await this.addComment();
      const comment = await this.getComment(commentId);

      if (!comment) {
        this.setError(400, {
          message: "Something went wrong!",
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
            message: error,
          } as OpenapiError);
      }
    }
  }

  private async getComment(id: number) {
    const comment = await unguess.tables.UgBugsComments.do()
      .select("id", "text", "creation_date_utc", "profile_id")
      .where("id", id)
      .first();

    if (!comment) return null;

    if (comment.profile_id === 0) {
      return {
        id: comment.id,
        text: comment.text,
        creation_date_utc: formatISO(
          zonedTimeToUtc(comment.creation_date_utc, "UTC")
        ),
        creator: {
          id: 0,
          name: "Name Surname",
        },
      };
    }

    const author = await tryber.tables.WpAppqEvdProfile.do()
      .select("id", "name", "surname")
      .where("id", comment?.profile_id)
      .first();

    if (!author) return null;

    return {
      id: comment.id,
      text: comment.text,
      creation_date_utc: formatISO(
        zonedTimeToUtc(comment.creation_date_utc, "UTC")
      ),
      creator: {
        id: author.id,
        name: `${author.name} ${author.surname}`,
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
    if (comment) {
      await this.sendEmail();
    }
    return comment[0].id ?? comment[0];
  }

  private replaceAll = (str: string, find: string, replace: string) => {
    return str.replace(new RegExp(find, "g"), replace);
  };

  private async getTemplate({
    template,
    optionalFields,
  }: {
    template: string;
    optionalFields?: { [key: string]: any };
  }) {
    const mailTemplate = await tryber.tables.WpAppqUnlayerMailTemplate.do()
      .select("html_body")
      .join(
        "wp_appq_event_transactional_mail",
        "wp_appq_event_transactional_mail.template_id",
        "wp_appq_unlayer_mail_template.id"
      )
      .where("wp_appq_event_transactional_mail.event_name", template)
      .first();

    if (!mailTemplate) return;

    let templateHtml = mailTemplate.html_body as string;

    if (optionalFields) {
      for (const key in optionalFields) {
        if (templateHtml.includes(key)) {
          templateHtml = this.replaceAll(
            templateHtml,
            key,
            optionalFields[key as keyof typeof optionalFields]
          );
        }
      }
    }

    return templateHtml;
  }
  private async sendEmail() {
    const html = await this.getTemplate({
      template: "notify_campaign_bug_approved",
      optionalFields: { "{{bug_id}}": this.bid, "{{bug_name}}": "bug name" },
    });

    if (!html) {
      throw new Error("No html email template");
    }
    const notification = {
      to: "",
      from: { name: "UNGUESS", email: "" },
      subject: "",
      html: "",
      categories: [""],
    };

    await sgMail.send(notification);
  }
}
