/** OPENAPI-CLASS: get-campaigns-replicabilities */
import CampaignRoute from "@src/features/routes/CampaignRoute";
import * as db from "@src/features/db";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-replicabilities"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-replicabilities"]["parameters"]["path"];
}> {
  protected async prepare() {
    this.setSuccess(200, []);
  }
}
