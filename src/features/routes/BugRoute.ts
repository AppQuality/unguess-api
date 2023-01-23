import * as db from "@src/features/db";
import CampaignRoute, { CampaignRouteParameters } from "./CampaignRoute";

export default class BugRoute<
  T extends RouteClassTypes & {
    parameters: T["parameters"] & CampaignRouteParameters & { bid: string };
  }
> extends CampaignRoute<T> {
  protected bug_id: number;

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
    const bugs: {
      id: number;
    }[] = await db.query(`
      SELECT 
        id
      FROM wp_appq_evd_bug 
      WHERE id = ${this.bug_id} AND campaign_id = ${this.cp_id}`);
    if (!bugs.length) return false;
    return bugs[0];
  }
}
