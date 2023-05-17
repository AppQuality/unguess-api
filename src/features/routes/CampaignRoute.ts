import UserRoute from "./UserRoute";
import * as db from "@src/features/db";
import { getProjectById } from "@src/utils/projects/getProjectById";
import { getTitleRule } from "@src/utils/campaigns/getTitleRule";
import { getCampaign } from "@src/utils/campaigns";

type CampaignRouteParameters = { cid: string };

export type { CampaignRouteParameters };

export default class CampaignRoute<
  T extends RouteClassTypes & {
    parameters: T["parameters"] & CampaignRouteParameters;
  }
> extends UserRoute<T> {
  protected cp_id: number;
  protected projectId: number | undefined;
  protected showNeedReview: boolean = false;
  protected baseBugInternalId: string = "";
  private NEED_REVIEW_STATUS_ID = 4;
  private APPROVED_STATUS_ID = 2;
  public CUSTOMER_TITLE_MAX_LENGTH = 256;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    const params = this.getParameters();

    if (!params?.cid) throw new Error("Missing campaign id");

    this.cp_id = parseInt(params.cid);
  }

  protected async init(): Promise<void> {
    await super.init();

    if (isNaN(this.cp_id)) {
      this.setError(400, {
        code: 400,
        message: "Invalid campaign id",
      } as OpenapiError);

      throw new Error("Invalid campaign id");
    }

    const campaign = await this.initCampaign();

    if (!campaign) {
      this.setError(400, {
        code: 400,
        message: "Campaign not found",
      } as OpenapiError);

      throw new Error("Campaign not found");
    }

    this.projectId = campaign.project_id;
    this.showNeedReview = campaign.showNeedReview;
    this.baseBugInternalId = campaign.base_bug_internal_id;
  }

  private async initCampaign() {
    const campaigns: {
      showNeedReview: boolean;
      project_id: number;
      base_bug_internal_id: string;
    }[] = await db.query(`
      SELECT 
        cust_bug_vis as showNeedReview,
        project_id,
        base_bug_internal_id
      FROM wp_appq_evd_campaign 
      WHERE id = ${this.cp_id}`);
    if (!campaigns.length) return false;
    return campaigns[0];
  }

  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) return false;

    if (!(await this.evaluateUserPermissions())) {
      return false
    };

    return true;
  }

  private async evaluateUserPermissions(): Promise<boolean> {
    /* 
      * This function returns the final results after reducing various Access Layers.
      * Order of the access checks matters here: 
      ** It should be ordered in a descending order.
      ** AccessToProject is super w.r.t. AccessToCampaign.
    */
    return (
      await Promise.all([
        await this.hasAccessToProject(),
        await this.hasAccessToCampaign(),
      ])
    ).reduce((prev, curr) => prev && curr, true);
  };

  private async hasAccessToCampaign(): Promise<boolean> {
    try {
      await getCampaign({ campaignId: this.cp_id });
    } catch (_error) {
      this.setError(403, {
        code: 400,
        message: "Do not have Access to the Campaign",
      } as OpenapiError);
      return false;
    }
    return true;
  }

  private async hasAccessToProject(): Promise<boolean> {
    try {
      await getProjectById({
        projectId: this.getProjectId(),
        user: this.getUser(),
      });
    } catch (_error) {
      this.setError(403, {
        code: 400,
        message: "Project not found",
      } as OpenapiError);
      return false;
    }
    return true;
  }

  protected getProjectId() {
    if (typeof this.projectId === "undefined")
      throw new Error("Invalid project");
    return this.projectId;
  }

  protected async getTags(): Promise<
    Array<{
      tag_id: number;
      tag_name: string;
      bug_id: number;
    }>
  > {
    return await db.query(`
      SELECT
        tag_id,
        display_name as tag_name,
        bug_id
      FROM wp_appq_bug_taxonomy
      WHERE campaign_id = ${this.cp_id} and is_public=1
    `);
  }

  protected shouldShowNeedReview(): boolean {
    return this.showNeedReview;
  }

  protected async getTitleRuleStatus() {
    return await getTitleRule(this.cp_id);
  }

  protected acceptedStatuses(): number[] {
    if (this.shouldShowNeedReview()) {
      return [this.NEED_REVIEW_STATUS_ID, this.APPROVED_STATUS_ID];
    }
    return [this.APPROVED_STATUS_ID];
  }
}
