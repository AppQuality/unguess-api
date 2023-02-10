/** OPENAPI-CLASS: get-campaigns-cid-severities */
import * as db from "@src/features/db";
import CampaignRoute from "@src/features/routes/CampaignRoute";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-severities"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-severities"]["parameters"]["path"];
}> {
  private severities: { id: number; name: string }[] = [];

  protected async init(): Promise<void> {
    await super.init();
    this.severities = await db.query(
      "SELECT id, name FROM wp_appq_evd_severity ORDER BY id DESC"
    );
  }

  protected async prepare(): Promise<void> {
    const cpSeverities = await this.getCampaignSeverities();
    return this.setSuccess(200, cpSeverities);
  }

  private async getCampaignSeverities() {
    const result = await this.getCustomSeverityList();
    if (result.length === 0) return this.severities;

    const bugSeverities = await this.getBugSeverities();
    for (const bugSeverity of bugSeverities) {
      if (!result.find((item) => item.id === bugSeverity.id)) {
        result.push(bugSeverity);
      }
    }
    return result.sort((sev) => sev.id).reverse();
  }

  private async getCustomSeverityList() {
    const result: { id: number; name: string }[] = await db.query(
      db.format(
        `SELECT sev.id, sev.name
      FROM wp_appq_evd_severity sev
               JOIN wp_appq_additional_bug_severities add_sev 
                   ON sev.id = add_sev.bug_severity_id
      WHERE campaign_id = ?`,
        [this.cp_id]
      )
    );
    return result;
  }

  private async getBugSeverities() {
    const res = await db.query(
      db.format(
        `SELECT sev.id, sev.name
            FROM wp_appq_evd_severity sev
            JOIN wp_appq_evd_bug bug ON (sev.id = bug.severity_id)
            JOIN wp_appq_evd_bug_status bstatus ON (bug.status_id = bstatus.id)
        WHERE campaign_id = ? AND publish = 1
        AND ${
          this.shouldShowNeedReview()
            ? `(bstatus.name = 'Approved' OR bstatus.name = 'Need Review')`
            : `bstatus.name = 'Approved'`
        }
        GROUP BY sev.id ORDER BY sev.id DESC`,
        [this.cp_id]
      )
    );
    return res;
  }
}
