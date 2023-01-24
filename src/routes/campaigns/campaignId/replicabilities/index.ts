/** OPENAPI-CLASS: get-campaigns-replicabilities */
import CampaignRoute from "@src/features/routes/CampaignRoute";
import * as db from "@src/features/db";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-replicabilities"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-replicabilities"]["parameters"]["path"];
}> {
  protected async prepare() {
    const replicabilities = await this.getReplicabilities();
    this.setSuccess(200, replicabilities);
  }

  private async getReplicabilities() {
    const result: {
      id: number;
      name: string;
    }[] = await db.query(
      db.format(
        `
        SELECT rep.id, rep.name
        FROM wp_appq_additional_bug_replicabilities cp_rep
                 JOIN wp_appq_evd_bug_replicability rep 
                     ON rep.id = cp_rep.bug_replicability_id
        WHERE cp_rep.campaign_id = ?
              `,
        [this.cp_id]
      )
    );

    return result;
  }
}
