/** OPENAPI-CLASS: post-analytics-views-campaigns-cid */

import CampaignRoute from "@src/features/routes/CampaignRoute";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["post-analytics-views-campaigns-cid"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["post-analytics-views-campaigns-cid"]["parameters"]["path"];
}> {
  protected async prepare(): Promise<void> {
    return this.setSuccess(200, {
      success: true,
    });
  }
}
