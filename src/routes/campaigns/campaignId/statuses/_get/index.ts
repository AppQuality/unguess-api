/** OPENAPI-CLASS: get-campaigns-cid-statuses */
import * as db from "@src/features/db";
import CampaignRoute from "@src/features/routes/CampaignRoute";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-statuses"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-statuses"]["parameters"]["path"];
}> {
  private statuses: { id: number; name: string }[] = [];

  protected async init(): Promise<void> {
    await super.init();
    this.statuses = await db.query(
      "SELECT id, name FROM unguess_custom_status ORDER BY id DESC",
      "unguess"
    );
  }

  protected async prepare(): Promise<void> {
    return this.setSuccess(200, this.statuses);
  }
}
