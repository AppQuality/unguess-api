/** OPENAPI-CLASS: delete-campaigns-cid-custom_statuses */
import { unguess } from "@src/features/database";
import CampaignRoute from "@src/features/routes/CampaignRoute";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["delete-campaigns-cid-custom_statuses"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["delete-campaigns-cid-custom_statuses"]["parameters"]["path"];
  body: StoplightOperations["delete-campaigns-cid-custom_statuses"]["requestBody"]["content"]["application/json"];
}> {
  private customStatuses: (StoplightComponents["schemas"]["BugCustomStatus"] & {
    campaign_id: number | null;
  })[] = [];
  private campaignId: number = 0;
  private bodyCustomStatusIds: StoplightOperations["delete-campaigns-cid-custom_statuses"]["requestBody"]["content"]["application/json"] =
    [];

  protected async init(): Promise<void> {
    await super.init();
    this.campaignId = this.cp_id;
    this.customStatuses = await this.getAllCustomStatuses();
    this.bodyCustomStatusIds = this.getBodyCustomStatusIds();
  }

  protected async prepare(): Promise<void> {
    await this.deleteAndMigrateCustomStatuses();

    return this.setSuccess(200, {
      status: true,
    });
  }

  protected async filter() {
    if (!(await super.filter())) return false;

    if (!this.checkCustomStatusIds() || !this.checkTargetCustomStatusIds()) {
      this.setError(400, {} as OpenapiError);
      return false;
    }
    return true;
  }

  private async getAllCustomStatuses(): Promise<
    (StoplightComponents["schemas"]["BugCustomStatus"] & {
      campaign_id: number;
    })[]
  > {
    const campaignId = this.campaignId;
    const results = await unguess.tables.WpUgBugCustomStatus.do()
      .select(
        unguess.ref("id").withSchema("wp_ug_bug_custom_status"),
        unguess.ref("name").withSchema("wp_ug_bug_custom_status"),
        unguess.ref("color").withSchema("wp_ug_bug_custom_status"),
        unguess.ref("is_default").withSchema("wp_ug_bug_custom_status"),
        unguess.ref("campaign_id").withSchema("wp_ug_bug_custom_status"),
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
        "wp_ug_bug_custom_status_phase.id"
      )
      .where("campaign_id", campaignId)
      .orWhereNull("campaign_id")
      .orderBy("wp_ug_bug_custom_status.phase_id", "asc")
      .orderBy("wp_ug_bug_custom_status.id", "asc");

    return results.map((result) => ({
      id: result.id,
      name: result.name,
      phase: {
        id: result.phase_id,
        name: result.phase_name,
      },
      color: result.color,
      is_default: result.is_default,
      campaign_id: result.campaign_id,
    }));
  }

  private getBodyCustomStatusIds() {
    return this.getBody();
  }

  private checkCustomStatusIds() {
    return this.bodyCustomStatusIds.every((bodyCustomStatus) =>
      this.customStatuses.some(
        (customStatus) =>
          customStatus.id === bodyCustomStatus.custom_status_id &&
          customStatus.is_default === 0 &&
          customStatus.campaign_id === this.campaignId
      )
    );
  }

  private checkTargetCustomStatusIds() {
    const defaultCustomStatusIds = this.customStatuses
      .filter((customStatus) => customStatus.is_default === 1)
      .map((customStatus) => customStatus.id);

    return this.bodyCustomStatusIds.every((bodyCustomStatus) =>
      this.customStatuses.some((customStatus) => {
        if (!bodyCustomStatus.to_custom_status_id) return true;
        if (
          defaultCustomStatusIds.includes(bodyCustomStatus.to_custom_status_id)
        )
          return true;
        if (
          customStatus.id === bodyCustomStatus.to_custom_status_id &&
          customStatus.is_default === 0 &&
          customStatus.campaign_id === this.campaignId
        )
          return true;
        return false;
      })
    );
  }

  private async deleteAndMigrateCustomStatuses() {
    // TODO: add knex.transaction() to process the delete queries
    return Promise.all(
      this.bodyCustomStatusIds.map(async (customStatus) => {
        // Delete custom status
        await unguess.tables.WpUgBugCustomStatus.do()
          .delete()
          .where("id", customStatus.custom_status_id);

        if (customStatus.to_custom_status_id) {
          // Migrate bugs to new custom status
          await unguess.tables.WpUgBugCustomStatusToBug.do()
            .update({
              custom_status_id: customStatus.to_custom_status_id,
            })
            .where("custom_status_id", customStatus.custom_status_id);
        } else {
          // Delete custom status to bug to set default (no record)
          await unguess.tables.WpUgBugCustomStatusToBug.do()
            .delete()
            .where("custom_status_id", customStatus.custom_status_id);
        }
      })
    );
  }
}
