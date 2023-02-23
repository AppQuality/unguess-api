/** OPENAPI-CLASS: get-campaigns-cid-meta */
import UserRoute from "@src/features/routes/UserRoute";
import { getCampaign, getCampaignMeta } from "@src/utils/campaigns";
import { getProjectById } from "@src/utils/projects";

export default class Route extends UserRoute<{
  response: StoplightOperations["get-campaigns-cid-meta"]["responses"]["200"]["content"]["application/json"];
  query: StoplightOperations["get-campaigns-cid-meta"]["parameters"]["path"];
}> {
  private campaignId: number;
  private campaign: any;
  private meta: any;

  constructor(config: RouteClassConfiguration) {
    super(config);
    this.campaignId = this.getQuery().cid;
  }
  protected async filter(): Promise<boolean> {
    this.campaign = await getCampaign({
      campaignId: this.campaignId,
    });
    if (!this.campaign) {
      this.setError(403, {} as OpenapiError);
      return false;
    }

    this.meta = await getProjectById({
      projectId: this.campaign.project.id,
      user: this.getUser(),
    });

    if (!this.meta) {
      this.setError(403, {} as OpenapiError);
      return false;
    }

    return true;
  }

  protected async prepare() {
    return this.setSuccess(200, {
      ...this.campaign,
      ...this.meta,
    });
  }
}
