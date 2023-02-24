/** OPENAPI-CLASS: get-campaigns-reports */
import CampaignRoute from "@src/features/routes/CampaignRoute";
import { getCampaign, getCampaignReports } from "@src/utils/campaigns";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-meta"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-meta"]["parameters"]["path"];
}> {
  protected async prepare() {
    if (!(await getCampaign({ campaignId: this.cp_id })))
      return this.setError(403, {} as OpenapiError);

    const reports: any = await getCampaignReports(this.cp_id);
    if (!reports) return this.setError(403, {} as OpenapiError);

    return this.setSuccess(200, reports);
  }
}
