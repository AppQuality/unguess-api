/** OPENAPI-CLASS: get-campaigns-reports */
import CampaignRoute from "@src/features/routes/CampaignRoute";
import { getCampaignReports } from "@src/utils/campaigns";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-reports"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-reports"]["parameters"]["path"];
}> {
  protected async prepare() {
    const reports = await getCampaignReports(this.cp_id);
    if (!reports) return this.setError(403, {} as OpenapiError);

    return this.setSuccess(200, reports);
  }
}
