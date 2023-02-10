/** OPENAPI-CLASS: get-campaigns-cid-os */
import CampaignRoute from "@src/features/routes/CampaignRoute";
import * as db from "@src/features/db";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-os"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-os"]["parameters"]["path"];
}> {
  protected async prepare() {
    const devices = await this.getBugOs();
    this.setSuccess(200, this.formatBugOs(devices));
  }

  private async getBugOs() {
    const os: {
      os: string;
      os_version: string;
    }[] = await db.query(
      db.format(
        `
          SELECT bug.os, bug.os_version
      FROM wp_appq_evd_bug bug
              JOIN wp_appq_evd_bug_status bstatus ON (bug.status_id = bstatus.id)
      WHERE campaign_id = ?
      AND bug.publish = 1
      AND ${
        this.shouldShowNeedReview()
          ? `(bstatus.name = 'Approved' OR bstatus.name = 'Need Review')`
          : `bstatus.name = 'Approved'`
      }
      GROUP BY (bug.dev_id);
      `,
        [this.cp_id]
      )
    );

    return os;
  }

  private formatBugOs(os: Awaited<ReturnType<typeof this.getBugOs>>) {
    const osList = os.map((d) => `${d.os} ${d.os_version}`);

    return [...new Set(osList)].map((os) => ({ os }));
  }
}
