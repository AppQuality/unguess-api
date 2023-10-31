/** OPENAPI-CLASS: delete-campaigns-cid-custom_statuses */
import { unguess } from "@src/features/database";
import CampaignRoute from "@src/features/routes/CampaignRoute";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["delete-campaigns-cid-custom_statuses"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["delete-campaigns-cid-custom_statuses"]["parameters"]["path"];
}> {
  private customStatuses: StoplightComponents["schemas"]["BugCustomStatus"][] =
    [];

  protected async init(): Promise<void> {
    await super.init();
    const campaignId = this.cp_id;
  }

  protected async prepare(): Promise<void> {
    return this.setSuccess(200, {
      status: true,
    });
  }
}
