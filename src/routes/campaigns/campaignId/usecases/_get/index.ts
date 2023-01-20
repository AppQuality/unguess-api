/** OPENAPI-CLASS: get-campaigns-cid-usecases */

import CampaignRoute from "@src/features/routes/CampaignRoute";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-usecases"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-usecases"]["parameters"]["path"];
}> {
  protected async prepare(): Promise<void> {
    const cpId = this.cp_id;
    const campaignUsecases = [
      {
        id: 1,
        title: { full: "Usecase 1" },
        description: "usecase description",
        totalBugs: 19,
      },
    ];
    return this.setSuccess(200, campaignUsecases);
  }
}
