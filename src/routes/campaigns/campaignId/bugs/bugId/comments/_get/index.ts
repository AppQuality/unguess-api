/** OPENAPI-CLASS: get-campaigns-cid-bugs-bid-comments */
import { tryber, unguess } from "@src/features/database";
import BugsRoute from "@src/features/routes/BugRoute";
import { ERROR_MESSAGE } from "@src/utils/constants";
import { isInternal } from "@src/utils/users/isInternal";
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

  private async addProfileToComment(
    comments: Awaited<ReturnType<typeof this.getComments>>
  ) {
    const profilesIds = comments.map((comment) => comment.profile_id);

    const result = await tryber.tables.WpAppqEvdProfile.do()
      .select("id", "name", "surname", "email")
      .whereIn("id", profilesIds);

    const commentsWithAuthors = comments.map((comment) => {
      const profile = result.find(
        (profile) => profile.id === comment.profile_id
      );

      if (!profile)
        return {
          ...comment,
          creator: {
            id: comment.profile_id,
            name: `Name S.`,
            isInternal: false,
          },
        };

      const surname = profile.surname
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + ".")
        .join(" ");

      return {
        ...comment,
        creator: {
          id: comment.profile_id,
          name: `${profile.name} ${surname}`,
          isInternal: isInternal(profile.email),
        },
      };
    });

    return commentsWithAuthors;
  }

  private async getComments() {
    const result = await unguess.tables.UgBugsComments.do()
      .select()
      .where("bug_id", this.bug_id)
      .andWhere("is_deleted", 0);

    if (!result || !result.length) return [];

    return result;
  }

  private async getBugComments() {
    const comments = await this.getComments();
    const commentsWithAuthors = await this.addProfileToComment(comments);

    return {
      items: commentsWithAuthors.map((comment) => ({
        id: comment.id,
        text: comment.text,
        creation_date: zonedTimeToUtc(
          comment.creation_date_utc,
          "UTC"
        ).toISOString(),
        creator: comment.creator,
      })),
    };
  }

  private emptyResponse() {
    return this.setSuccess(200, {
      items: [],
    });
  }
}
