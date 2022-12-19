/** OPENAPI-CLASS: get-campaigns-cid-bug-types */
import { ERROR_MESSAGE } from "@src/utils/constants";
import { getCampaign } from "@src/utils/campaigns";
import UserRoute from "@src/features/routes/UserRoute";
import { getProjectById } from "@src/utils/projects";
import * as db from "@src/features/db";

export default class Route extends UserRoute<{
  response: StoplightOperations["get-campaigns-cid-bug-types"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-bug-types"]["parameters"]["path"];
}> {
  private cid: number;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    const params = this.getParameters();
    this.cid = parseInt(params.cid);
  }

  protected async filter(): Promise<boolean> {
    if (!super.filter()) return false;

    const campaign = await getCampaign({ campaignId: this.cid });

    if (!campaign) {
      this.setError(400, {
        status_code: 400,
        message: ERROR_MESSAGE,
      } as OpenapiError);
      return false;
    }
    try {
      // Check if user has permission to edit the campaign
      console.log(campaign.project.id);
      await getProjectById({
        projectId: campaign.project.id,
        user: this.getUser(),
      });
    } catch (e) {
      console.log(e);
      this.setError(403, {
        message: ERROR_MESSAGE,
      } as OpenapiError);
      return false;
    }
    return true;
  }

  protected async prepare(): Promise<void> {
    const bugTypes = await db.query(
      "SELECT id, name FROM wp_appq_evd_bug_type WHERE is_enabled = 1"
    );
    return this.setSuccess(200, bugTypes);
  }
}
