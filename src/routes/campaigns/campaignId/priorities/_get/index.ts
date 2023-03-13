/** OPENAPI-CLASS: get-campaigns-cid-priorities */
import * as db from "@src/features/db";
import CampaignRoute from "@src/features/routes/CampaignRoute";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-priorities"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-priorities"]["parameters"]["path"];
}> {
  private priorities: { id: number; name: string }[] = [];

  protected async init(): Promise<void> {
    await super.init();
    this.priorities = await db.query(
      "SELECT id, name FROM wp_ug_priority ORDER BY id DESC", 
      "unguess"
    );
  }

  protected async prepare(): Promise<void> {
    return this.setSuccess(200, this.priorities);
  }
}
