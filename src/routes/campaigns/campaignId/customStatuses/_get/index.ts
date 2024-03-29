/** OPENAPI-CLASS: get-campaigns-cid-custom-statuses */
import { unguess } from "@src/features/database";
import CampaignRoute from "@src/features/routes/CampaignRoute";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-custom-statuses"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-custom-statuses"]["parameters"]["path"];
}> {
  private customStatuses: StoplightComponents["schemas"]["BugCustomStatus"][] =
    [];

  protected async init(): Promise<void> {
    await super.init();
    const campaignId = this.cp_id;
    const results = await unguess.tables.WpUgBugCustomStatus.do()
      .select(
        unguess.ref("id").withSchema("wp_ug_bug_custom_status"),
        unguess.ref("name").withSchema("wp_ug_bug_custom_status"),
        unguess.ref("color").withSchema("wp_ug_bug_custom_status"),
        unguess.ref("is_default").withSchema("wp_ug_bug_custom_status"),
        unguess
          .ref("id")
          .withSchema("wp_ug_bug_custom_status_phase")
          .as("phase_id"),
        unguess
          .ref("name")
          .withSchema("wp_ug_bug_custom_status_phase")
          .as("phase_name")
      )
      .join(
        "wp_ug_bug_custom_status_phase",
        "wp_ug_bug_custom_status.phase_id",
        "=",
        "wp_ug_bug_custom_status_phase.id"
      )
      .where("campaign_id", campaignId)
      .orWhereNull("campaign_id")
      .orderBy("wp_ug_bug_custom_status.phase_id", "asc")
      .orderBy("wp_ug_bug_custom_status.id", "asc");

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
