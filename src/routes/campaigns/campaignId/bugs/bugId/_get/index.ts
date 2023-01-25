/** OPENAPI-CLASS: get-campaigns-single-bug */
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
    this.setSuccess(200, bug);
  }
}
