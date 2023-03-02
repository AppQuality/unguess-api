/** OPENAPI-CLASS: get-campaign */
import { getCampaign } from "@src/utils/campaigns";
import CampaignRoute from "@src/features/routes/CampaignRoute";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaign"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaign"]["parameters"]["path"];
}> {
  protected async prepare() {
    const campaign = await getCampaign({
      campaignId: this.cp_id,
      withOutputs: true,
    });

    if (!campaign) return this.setError(404, {} as OpenapiError);

    this.setSuccess(200, campaign);
  }
}
