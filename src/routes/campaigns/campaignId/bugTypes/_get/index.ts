/** OPENAPI-CLASS: get-campaigns-cid-bug-types */

import * as db from "@src/features/db";
import CampaignRoute from "@src/features/routes/CampaignRoute";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-bug-types"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-bug-types"]["parameters"]["path"];
}> {
  private types: { id: number; name: string }[] = [];

  protected async init(): Promise<void> {
    await super.init();
    this.types = await db.query(
      "SELECT id, name FROM wp_appq_evd_bug_type WHERE is_enabled = 1"
    );
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
        [this.cp_id]
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
            JOIN wp_appq_evd_bug_status bstatus ON (bug.status_id = bstatus.id)
        WHERE campaign_id = ? AND  btype.is_enabled = 1 AND publish = 1
        AND ${
          this.shouldShowNeedReview()
            ? `(bstatus.name = 'Approved' OR bstatus.name = 'Need Review')`
            : `bstatus.name = 'Approved'`
        }
        GROUP BY btype.id`,
        [this.cp_id]
      )
    );
  }
}
