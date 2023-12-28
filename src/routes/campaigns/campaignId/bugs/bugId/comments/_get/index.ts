/** OPENAPI-CLASS: get-campaigns-cid-bugs-bid-comments */
import { tryber, unguess } from "@src/features/database";
import BugsRoute from "@src/features/routes/BugRoute";
import { ERROR_MESSAGE } from "@src/utils/constants";
import { zonedTimeToUtc } from "date-fns-tz";

export default class Route extends BugsRoute<{
  response: StoplightOperations["get-campaigns-cid-bugs-bid-comments"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-bugs-bid-comments"]["parameters"]["path"];
}> {
  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) return false;

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

  protected async prepare() {
    let comments;
    try {
      comments = await this.getBugComments();
    } catch (e: any) {
      return this.setError(500, {
        message: e.message || ERROR_MESSAGE,
        status_code: 500,
      } as OpenapiError);
    }
    if (!comments.items || !comments.items.length) return this.emptyResponse();
    return this.setSuccess(200, comments);
  }

  private async getProfile(profileId: number) {
    const result = await tryber.tables.WpAppqEvdProfile.do()
      .select("name", "surname")
      .where("id", profileId)
      .first();
    if (!result) return null;
    return `${result.name} ${result.surname}`;
  }

  private async getBugComments() {
    const result = await unguess.tables.UgBugsComments.do()
      .select()
      .where("bug_id", this.bug_id)
      .andWhere("is_deleted", 0);
    const comments = await Promise.all(
      result.map(async (comment) => ({
        id: comment.id,
        text: comment.text,
        creation_date: zonedTimeToUtc(
          comment.creation_date_utc,
          "UTC"
        ).toISOString(),
        creator: {
          id: comment.profile_id,
          name: (await this.getProfile(comment.profile_id)) || "Name Surname",
        },
      }))
    );
    return {
      items: comments,
    };
  }

  private emptyResponse() {
    return this.setSuccess(200, {
      items: [],
    });
  }
}
