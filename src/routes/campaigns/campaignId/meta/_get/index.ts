/** OPENAPI-CLASS: get-campaigns-cid-meta */
import UserRoute from "@src/features/routes/UserRoute";
import { getCampaign, getCampaignMeta } from "@src/utils/campaigns";
import { getProjectById } from "@src/utils/projects";

export default class Route extends UserRoute<{
  response: StoplightOperations["get-campaigns-cid-meta"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-meta"]["parameters"];
}> {
  private params: any;
  private campaignId: any;
  private campaign: any;
  private meta: any;

  constructor(config: RouteClassConfiguration) {
    super(config);
    this.params = this.getParameters();
    this.campaignId = this.params.cid;
  }

  protected async filter() {
    if (!(await super.filter())) return false;

    this.campaign = await getCampaign({ campaignId: this.campaignId });

    if (!this.campaign) {
      this.setError(400, { message: "Campaign not found" } as OpenapiError);
      return false;
    }

    const { id: projectId } = await getProjectById({
      projectId: this.campaign.project.id,
      user: this.getUser(),
    });

    this.meta = await getCampaignMeta(this.campaign);

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
