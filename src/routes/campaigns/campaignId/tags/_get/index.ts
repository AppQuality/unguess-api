/** OPENAPI-CLASS: get-campaigns-cid-tags */
import * as db from "@src/features/db";
import CampaignRoute from "@src/features/routes/CampaignRoute";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-tags"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-tags"]["parameters"]["path"];
}> {
  protected async prepare(): Promise<void> {
    return this.setSuccess(
      200,
      await db.query(
        db.format(
          ` SELECT tag_id, display_name, slug
          FROM wp_appq_bug_taxonomy 
          WHERE campaign_id = ? AND is_public = 1
          GROUP BY tag_id`,
          [this.cp_id]
        )
      )
    );
  }
}
