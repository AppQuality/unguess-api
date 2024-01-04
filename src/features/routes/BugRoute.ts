import * as db from "@src/features/db";
import CampaignRoute, { CampaignRouteParameters } from "./CampaignRoute";

export default class BugRoute<
  T extends RouteClassTypes & {
    parameters: T["parameters"] & CampaignRouteParameters & { bid: string };
  }
> extends CampaignRoute<T> {
  protected bug_id: number;
  protected bug:
    | {
        id: number;
        is_duplicated: 0 | 1;
        duplicated_of_id: number;
        status_id: 1 | 2 | 3 | 4;
      }
    | undefined;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    const params = this.getParameters();
    if (!params?.bid) throw new Error("Missing bug id");
    this.bug_id = Number(params.bid);
  }

  protected async init(): Promise<void> {
    await super.init();

    if (isNaN(this.bug_id)) {
      this.setError(400, {
        code: 400,
        message: "Invalid bug id",
      } as OpenapiError);

      throw new Error("Invalid bug id");
    }
    const bug = await this.initBug();

    if (!bug) {
      this.setError(400, {
        code: 400,
        message: "Bug not found",
      } as OpenapiError);

      throw new Error("Bug not found");
    }
  }

  private async initBug() {
    const bugs = await db.query(`
      SELECT 
        id, is_duplicated, duplicated_of_id, status_id
      FROM wp_appq_evd_bug 
      WHERE id = ${this.bug_id} AND campaign_id = ${this.cp_id}`);
    if (!bugs.length) return false;
    this.bug = bugs[0];
    return this.bug;
  }

  protected getBug() {
    if (!this.bug) throw new Error("Bug not found");
    return this.bug;
  }

  protected shouldShowThisBug() {
    return this.acceptedStatuses().includes(this.getBug().status_id);
  }
}
