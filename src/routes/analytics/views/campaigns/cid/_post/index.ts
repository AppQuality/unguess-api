/** OPENAPI-CLASS: post-analytics-views-campaigns-cid */
import CampaignRoute from "@src/features/routes/CampaignRoute";
import * as db from "@src/features/db";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["post-analytics-views-campaigns-cid"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["post-analytics-views-campaigns-cid"]["parameters"]["path"];
}> {
  protected async prepare(): Promise<void> {
    if (await this.campaignReadStatusAlreadyExists()) {
      await this.updateCampaignReadStatus();
    } else {
      await this.newCampaignReadStatus();
    }
    return this.setSuccess(200, {
      success: true,
    });
  }

  private async campaignReadStatusAlreadyExists() {
    const results = await db.query(
      db.format(
        `SELECT * FROM wp_ug_campaign_read_status 
          WHERE campaign_id = ? AND unguess_wp_user_id = ?`,
        [this.cp_id, this.getWordpressId("unguess")]
      ),
      "unguess"
    );
    return results.length > 0;
  }

  private async updateCampaignReadStatus() {
    await db.query(
      db.format(
        `UPDATE wp_ug_campaign_read_status 
        SET is_read=1, last_read_on = NOW()
        WHERE campaign_id = ? AND unguess_wp_user_id = ?`,
        [this.cp_id, this.getWordpressId("unguess")]
      ),
      "unguess"
    );
  }

  private async newCampaignReadStatus() {
    await db.query(
      db.format(
        `INSERT INTO wp_ug_campaign_read_status
          (campaign_id,unguess_wp_user_id,is_read,read_on,last_read_on) 
          VALUES (?,?, 1, NOW(), NOW() )`,
        [this.cp_id, this.getWordpressId("unguess")]
      ),
      "unguess"
    );
  }
}
