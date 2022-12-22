/** OPENAPI-CLASS: get-campaigns-cid-severities */
import { ERROR_MESSAGE } from "@src/utils/constants";
import { getCampaign } from "@src/utils/campaigns";
import UserRoute from "@src/features/routes/UserRoute";
import { getProjectById } from "@src/utils/projects";
import * as db from "@src/features/db";

export default class Route extends UserRoute<{
  response: StoplightOperations["get-campaigns-cid-severities"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-severities"]["parameters"]["path"];
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
      await getProjectById({
        projectId: campaign.project.id,
        user: this.getUser(),
      });
    } catch (e) {
      this.setError(403, {
        message: ERROR_MESSAGE,
      } as OpenapiError);
      return false;
    }
    return true;
  }

  protected async prepare(): Promise<void> {
    const cpBugTypes = await db.query(
      db.format(
        `SELECT sev.id, sev.name
      FROM wp_appq_evd_severity sev
               JOIN wp_appq_additional_bug_severities add_sev 
                   ON sev.id = add_sev.bug_severity_id
      WHERE campaign_id = ?`,
        [this.cid]
      )
    );
    if (cpBugTypes.length === 0) {
      const allSeverities = await db.query(
        "SELECT id, name FROM wp_appq_evd_severity"
      );
      return this.setSuccess(200, allSeverities);
    }
    return this.setSuccess(200, cpBugTypes);
  }
}
