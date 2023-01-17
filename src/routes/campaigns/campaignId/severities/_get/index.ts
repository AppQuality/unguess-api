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
  private severities: { id: number; name: string }[] | undefined;
  private showNeedReview: boolean = false;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    const params = this.getParameters();
    this.cid = parseInt(params.cid);
  }

  protected async init(): Promise<void> {
    this.severities = await db.query(
      "SELECT id, name FROM wp_appq_evd_severity"
    );

    const campaign = await this.initCampaign();
    if (campaign) this.showNeedReview = campaign.showNeedReview;
  }

  private async initCampaign() {
    const campaigns: {
      showNeedReview: boolean;
    }[] = await db.query(`
      SELECT 
        cust_bug_vis as showNeedReview
      FROM wp_appq_evd_campaign 
      WHERE id = ${this.cid}`);
    if (!campaigns.length) return false;
    return campaigns[0];
  }

  private shouldShowNeedReview(): boolean {
    return this.showNeedReview;
  }

  private getSeverities() {
    if (!this.severities) return [];
    return this.severities;
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
    const cpSeverities = await this.getCampaignSeverities();
    return this.setSuccess(200, cpSeverities);
  }

  private async getCampaignSeverities() {
    const result = await this.getCustomSeverityList();
    if (result.length === 0) return this.getSeverities();

    const bugSeverities = await this.getBugSeverities();
    for (const bugSeverity of bugSeverities) {
      if (!result.find((item) => item.id === bugSeverity.id)) {
        result.push(bugSeverity);
      }
    }
    return result;
  }

  private async getCustomSeverityList() {
    const result: { id: number; name: string }[] = await db.query(
      db.format(
        `SELECT sev.id, sev.name
      FROM wp_appq_evd_severity sev
               JOIN wp_appq_additional_bug_severities add_sev 
                   ON sev.id = add_sev.bug_severity_id
      WHERE campaign_id = ?`,
        [this.cid]
      )
    );
    return result;
  }

  private async getBugSeverities() {
    return await db.query(
      db.format(
        `SELECT sev.id, sev.name
            FROM wp_appq_evd_severity sev
            JOIN wp_appq_evd_bug bug ON (sev.id = bug.severity_id)
            JOIN wp_appq_evd_bug_status bstatus ON (bug.status_id = bstatus.id)
        WHERE campaign_id = ? AND publish = 1
        AND ${
          this.shouldShowNeedReview()
            ? `(bstatus.name = 'Approved' OR bstatus.name = 'Need Review')`
            : `bstatus.name = 'Approved'`
        }
        GROUP BY sev.id`,
        [this.cid]
      )
    );
  }
}
