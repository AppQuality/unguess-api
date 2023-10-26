/** OPENAPI-CLASS: get-campaigns-cid-custom-statuses */
import { unguess } from "@src/features/database";
import * as db from "@src/features/db";
import CampaignRoute from "@src/features/routes/CampaignRoute";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-custom-statuses"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-custom-statuses"]["parameters"]["path"];
}> {
  private customStatuses: StoplightComponents["schemas"]["BugCustomStatus"][] =
    [];

  protected async init(): Promise<void> {
    await super.init();
    const results: {
      id: number;
      name: string;
      color: string;
      is_default: number;
      phase_id: number;
      phase_name: string;
    }[] = await db.query(
      `SELECT 
        cs.id, 
        cs.name, 
        cs.color, 
        cs.is_default,
        csp.id as phase_id,
        csp.name as phase_name
      FROM wp_ug_bug_custom_status cs
      JOIN wp_ug_bug_custom_status_phase csp ON (cs.phase_id = csp.id)
      ORDER BY cs.id DESC`,
      "unguess"
    );

    this.customStatuses = results.map((result) => ({
      id: result.id,
      name: result.name,
      phase: {
        id: result.phase_id,
        name: result.phase_name,
      },
      color: result.color,
      is_default: result.is_default,
    }));
  }
  protected async prepare(): Promise<void> {
    return this.setSuccess(200, this.customStatuses);
  }
}
