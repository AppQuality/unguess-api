import UserRoute from "./UserRoute";
import * as db from "@src/features/db";
import { getProjectById } from "@src/utils/projects/getProjectById";
import { getTitleRule } from "@src/utils/campaigns/getTitleRule";

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

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    const { cid } = this.getParameters();
    this.cp_id = parseInt(cid);
  }

  protected async init(): Promise<void> {
    await super.init();
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

    if (!(await this.hasAccessToProject())) {
      this.setError(403, {
        code: 400,
        message: "Project not found",
      } as OpenapiError);
      return false;
    }

    return true;
  }

  private async hasAccessToProject() {
    try {
      await getProjectById({
        projectId: this.getProjectId(),
        user: this.getUser(),
      });
    } catch (error) {
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
