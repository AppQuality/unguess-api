/** OPENAPI-CLASS: get-campaigns-single-bug */
import * as db from "@src/features/db";
import { getBugById } from "@src/utils/bugs";
import BugsRoute from "@src/features/routes/BugRoute";

export default class Route extends BugsRoute<{
  response: StoplightOperations["get-campaigns-single-bug"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-single-bug"]["parameters"]["path"];
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

  protected async prepare(): Promise<void> {
    const bug = await getBugById({
      bugId: this.bug_id,
      campaignId: this.cp_id,
      showNeedReview: this.shouldShowNeedReview(),
    });
    await this.setBugAsRead();
    this.setSuccess(200, bug);
  }

  private async setBugAsRead() {
    const readStatus = await this.getReadStatus();

    if (readStatus) return;

    if (typeof readStatus === "undefined") {
      await db.query(
        db.format(
          "INSERT INTO wp_appq_bug_read_status (wp_id,bug_id,is_read) VALUES (?,?,1) ",
          [this.getWordpressId("tryber"), this.bug_id]
        )
      );
      return;
    }

    await db.query(
      db.format(
        "UPDATE wp_appq_bug_read_status SET is_read = 1 WHERE wp_id=? AND bug_id=? ",
        [this.getWordpressId("tryber"), this.bug_id]
      )
    );
  }

  private async getReadStatus() {
    const result = await db.query(
      db.format(
        "SELECT is_read FROM wp_appq_bug_read_status WHERE wp_id=? AND bug_id=?",
        [this.getWordpressId("tryber"), this.bug_id]
      )
    );
    if (!result.length) return undefined;
    return result[0].is_read === 1;
  }
}
