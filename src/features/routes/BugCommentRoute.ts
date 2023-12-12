import BugRoute from "./BugRoute";
import { CampaignRouteParameters } from "./CampaignRoute";
import { tryber, unguess } from "../database";
import { formatISO } from "date-fns";
import { zonedTimeToUtc } from "date-fns-tz";

export default class BugCommentRoute<
  T extends RouteClassTypes & {
    parameters: T["parameters"] &
      CampaignRouteParameters & { bid: string; cmid: string };
  }
> extends BugRoute<T> {
  protected comment_id: number;
  protected comment:
    | {
        id: number;
        bug_id: number;
        text: string;
        profile_id: number;
        creation_date_utc: string;
        is_deleted: number;
      }
    | undefined;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    const { cmid } = this.getParameters();
    this.comment_id = parseInt(cmid);
  }

  protected async init(): Promise<void> {
    await super.init();

    if (isNaN(this.comment_id)) {
      this.setError(400, {
        code: 400,
        message: "Invalid comment id",
      } as OpenapiError);

      throw new Error("Invalid comment id");
    }
    const comment = await this.initComment();

    if (!comment) {
      this.setError(400, {
        code: 400,
        message: "Comment not found",
      } as OpenapiError);

      throw new Error("Comment not found");
    }
  }

  private async initComment() {
    const comment = await unguess.tables.UgBugsComments.do()
      .select()
      .where("id", this.comment_id)
      .first();

    if (!comment) return null;
    const author = await tryber.tables.WpAppqEvdProfile.do()
      .select("id", "name", "surname")
      .where("id", comment.profile_id)
      .first();

    if (!author) return null;

    this.comment = comment;

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

  protected getComment() {
    return this.comment;
  }
}
