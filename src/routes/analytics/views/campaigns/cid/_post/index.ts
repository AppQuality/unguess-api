/** OPENAPI-CLASS: post-analytics-views-campaigns-cid */
import CampaignRoute from "@src/features/routes/CampaignRoute";
import { unguess } from "@src/features/database";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["post-analytics-views-campaigns-cid"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["post-analytics-views-campaigns-cid"]["parameters"]["path"];
}> {
  protected async prepare(): Promise<void> {
    await unguess.tables.WpUgCampaignReadStatus.do()
      .insert({
        is_read: 1,
        last_read_on: unguess.fn.now(),
        read_on: unguess.fn.now(),
        campaign_id: this.cp_id,
        unguess_wp_user_id: this.getWordpressId("unguess"),
      })
      .onConflict(["campaign_id", "unguess_wp_user_id"])
      .merge(["last_read_on", "is_read"]);

    return this.setSuccess(200, {
      success: true,
    });
  }
}
