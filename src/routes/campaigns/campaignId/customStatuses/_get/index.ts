/** OPENAPI-CLASS: get-campaigns-cid-custom-statuses */
import * as db from "@src/features/db";
import CampaignRoute from "@src/features/routes/CampaignRoute";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-custom-statuses"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-custom-statuses"]["parameters"]["path"];
}> {
  private customStatuses: { id: number; name: string }[] = [];

  protected async init(): Promise<void> {
    await super.init();
    this.customStatuses = await db.query(
      "SELECT id, name FROM wp_ug_bug_custom_status ORDER BY id DESC",
      "unguess"
    );
  }

  protected async prepare(): Promise<void> {
    return this.setSuccess(200, this.customStatuses);
  }
}
