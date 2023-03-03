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
  }

  protected async prepare(): Promise<void> {}

  private async getCampaignPriorities() {}
}
