/** OPENAPI-CLASS: delete-campaigns-cid-bugs-bid-comments-cmid */

import { unguess } from "@src/features/database";
import BugCommentRoute from "@src/features/routes/BugCommentRoute";

export default class Route extends BugCommentRoute<{
  parameters: StoplightOperations["delete-campaigns-cid-bugs-bid-comments-cmid"]["parameters"]["path"];
  response: StoplightOperations["delete-campaigns-cid-bugs-bid-comments-cmid"]["responses"]["200"];
}> {
  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) {
      this.setError(403, { message: "Something went wrong!" } as OpenapiError);
      return false;
    }
    return true;
  }
  protected async prepare(): Promise<void> {
    try {
      await this.deleteComment();
      return this.setSuccess(200, {});
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
  private async deleteComment() {
    await unguess.tables.UgBugsComments.do()
      .update({ is_deleted: 1 })
      .where("id", this.comment_id);
  }
}
