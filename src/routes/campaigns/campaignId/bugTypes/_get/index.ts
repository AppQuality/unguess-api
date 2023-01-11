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
  private types: { id: number; name: string }[] = [];
  private showNeedReview: boolean = false;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    const params = this.getParameters();
    this.cid = parseInt(params.cid);
  }

  protected async init(): Promise<void> {
    this.types = await db.query(
      "SELECT id, name FROM wp_appq_evd_bug_type WHERE is_enabled = 1"
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
    if (this.getUser().role === "administrator") return true;
    return this.showNeedReview;
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
        code: 403,
        message: ERROR_MESSAGE,
      } as OpenapiError);
      return false;
    }
    return true;
  }

  protected async prepare(): Promise<void> {
    return this.setSuccess(200, await this.getCampaignTypes());
  }

  private async getCampaignTypes() {
    const result = await this.getCustomTypesList();
    if (result.length === 0) return this.types;

    const bugTypes = await this.getBugTypes();
    for (const bugType of bugTypes) {
      if (!result.find((item) => item.id === bugType.id)) {
        result.push(bugType);
      }
    }
    return result;
  }

  private async getCustomTypesList() {
    const result: { id: number; name: string }[] = await db.query(
      db.format(
        `SELECT btype.id, btype.name
        FROM wp_appq_evd_bug_type btype
                JOIN wp_appq_additional_bug_types add_btype 
                  ON btype.id = add_btype.bug_type_id
        WHERE btype.is_enabled = 1 AND add_btype.campaign_id = ?`,
        [this.cid]
      )
    );
    return result;
  }

  private async getBugTypes() {
    return await db.query(
      db.format(
        `SELECT btype.id, btype.name
            FROM wp_appq_evd_bug_type btype
            JOIN wp_appq_evd_bug bug ON (btype.id = bug.bug_type_id)
        WHERE campaign_id = ? AND  btype.is_enabled = 1 AND publish = 1
        AND status_id IN (${this.shouldShowNeedReview() ? "2,4" : "2"})
        GROUP BY btype.id`,
        [this.cid]
      )
    );
  }
}
