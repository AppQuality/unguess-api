import * as db from "@src/features/db";
import CampaignRoute, { CampaignRouteParameters } from "./CampaignRoute";

export default class BugRoute<
  T extends RouteClassTypes & {
    parameters: T["parameters"] & CampaignRouteParameters & { bid: string };
  }
> extends CampaignRoute<T> {
  protected bug_id: number;
  protected bug:
    | { id: number; is_duplicated: 0 | 1; duplicated_of_id: number }
    | undefined;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    const { bid } = this.getParameters();
    this.bug_id = parseInt(bid);
  }

  protected async init(): Promise<void> {
    await super.init();
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
        id, is_duplicated, duplicated_of_id
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
}
