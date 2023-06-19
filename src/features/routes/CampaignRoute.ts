import * as db from "@src/features/db";
import { getTitleRule } from "@src/utils/campaigns/getTitleRule";
import ProjectRoute from "./ProjectRoute";
import { tryber } from "../database";

type CampaignRouteParameters = { cid: string };

export type { CampaignRouteParameters };

export default class CampaignRoute<
  T extends RouteClassTypes & {
    parameters: T["parameters"] & CampaignRouteParameters;
  }
> extends ProjectRoute<T> {
  protected cp_id: number;
  protected campaignName: string = "";
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

    this.project_id = campaign.project_id;
    this.showNeedReview = campaign.showNeedReview === 1;
    this.baseBugInternalId = campaign.base_bug_internal_id;
    this.campaignName = campaign.customerTitle || campaign.internalTitle;

    await super.init();
  }

  private async initCampaign() {
    const campaign = await tryber.tables.WpAppqEvdCampaign.do()
      .select(
        tryber.ref("title").as("internalTitle"),
        tryber.ref("customer_title").as("customerTitle"),
        tryber.ref("cust_bug_vis").as("showNeedReview"),
        tryber.ref("project_id"),
        tryber.ref("base_bug_internal_id")
      )
      .where({ id: this.cp_id })
      .first();

    if (!campaign) return false;

    return campaign;
  }

  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) {
      // The user does NOT have access to the workspace or project
      const access = await this.checkCpAccess();

      if (!access) {
        this.setError(403, {
          code: 403,
          message: "Campaign not found or not accessible",
        } as OpenapiError);

        return false;
      }

      return true;
    }

    // The user HAS access to the workspace or project
    return true;
  }

  private async checkCpAccess(): Promise<boolean> {
    const hasAccess = await tryber.tables.WpAppqUserToCampaign.do()
      .select()
      .where({
        campaign_id: this.cp_id,
        wp_user_id: this.getUser().tryber_wp_user_id,
      })
      .first();

    if (!hasAccess) {
      this.setError(403, {
        code: 400,
        message: "You don't have access to this campaign",
      } as OpenapiError);
      return false;
    }

    return true;
  }

  protected getCampaignId() {
    if (typeof this.cp_id === "undefined") throw new Error("Invalid campaign");
    return this.cp_id;
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
