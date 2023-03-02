/** OPENAPI-CLASS: get-campaigns-cid-meta */
import CampaignRoute from "@src/features/routes/CampaignRoute";
import { getCampaign, getCampaignMeta } from "@src/utils/campaigns";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-meta"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-meta"]["parameters"]["path"];
}> {
  protected async prepare() {
    const campaign = await getCampaign({ campaignId: this.cp_id });
    if (!campaign) return this.setError(403, {} as OpenapiError);

    const meta = await getCampaignMeta(campaign);
    if (!meta) return this.setError(403, {} as OpenapiError);

    return this.setSuccess(200, {
      ...campaign,
      ...meta,
    });
  }
}
