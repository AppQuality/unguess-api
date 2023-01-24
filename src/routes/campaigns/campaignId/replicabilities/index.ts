/** OPENAPI-CLASS: get-campaigns-replicabilities */
import CampaignRoute from "@src/features/routes/CampaignRoute";
import * as db from "@src/features/db";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-replicabilities"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-replicabilities"]["parameters"]["path"];
}> {
  private replicabilities: { id: number; name: string }[] = [];

  protected async init(): Promise<void> {
    await super.init();
    this.replicabilities = await db.query(
      "SELECT id, name FROM wp_appq_evd_bug_replicability"
    );
  }

  protected async prepare(): Promise<void> {
    const cpReplicabilities = await this.getCampaignReplicabilities();
    return this.setSuccess(200, cpReplicabilities);
  }

  private async getCampaignReplicabilities() {
    const result = await this.getCustomReplicabilityList();
    if (result.length === 0) return this.replicabilities;

    const bugReplicabilities = await this.getBugReplicabilities();
    for (const bugReplicability of bugReplicabilities) {
      if (!result.find((item) => item.id === bugReplicability.id)) {
        result.push(bugReplicability);
      }
    }
    return result;
  }

  private async getCustomReplicabilityList() {
    const result: { id: number; name: string }[] = await db.query(
      db.format(
        `SELECT rep.id, rep.name
    FROM wp_appq_evd_bug_replicability rep
             JOIN wp_appq_additional_bug_replicabilities add_rep 
                 ON rep.id = add_rep.bug_replicability_id
    WHERE campaign_id = ?`,
        [this.cp_id]
      )
    );
    return result;
  }

  private async getBugReplicabilities() {
    return await db.query(
      db.format(
        `SELECT rep.id, rep.name
          FROM wp_appq_evd_bug_replicability rep
          JOIN wp_appq_evd_bug bug ON (rep.id = bug.bug_replicability_id)
          JOIN wp_appq_evd_bug_status bstatus ON (bug.status_id = bstatus.id)
      WHERE campaign_id = ? AND publish = 1
      AND ${
        this.shouldShowNeedReview()
          ? `(bstatus.name = 'Approved' OR bstatus.name = 'Need Review')`
          : `bstatus.name = 'Approved'`
      }
      GROUP BY rep.id`,
        [this.cp_id]
      )
    );
  }
}
