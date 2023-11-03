/** OPENAPI-CLASS: patch-campaigns-cid-custom_statuses */
import { unguess } from "@src/features/database";
import CampaignRoute from "@src/features/routes/CampaignRoute";

export default class Route extends CampaignRoute<{
  response: StoplightOperations["patch-campaigns-cid-custom_statuses"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["patch-campaigns-cid-custom_statuses"]["parameters"]["path"];
  body: StoplightOperations["patch-campaigns-cid-custom_statuses"]["requestBody"]["content"]["application/json"];
}> {
  protected async init(): Promise<void> {
    await super.init();
  }

  protected async prepare() {
    this.setSuccess(200, await this.editOrCreateCustomStatuses());
  }

  protected async filter() {
    if (!(await super.filter())) return false;
    if (this.isNameInvalid() || this.isBodyEmpty()) {
      this.setError(400, {} as OpenapiError);
      return false;
    }
    return true;
  }

  private isNameInvalid() {
    const body = this.getBody();
    const filteredBody = body.filter((item) => {
      return (
        item.name === undefined ||
        item.name === "" ||
        item.name.length > this.CUSTOM_STATUS_NAME_MAX_LENGTH
      );
    });
    return filteredBody.length > 0;
  }

  private isBodyEmpty() {
    return Object.keys(this.getBody()).length === 0;
  }

  private getItemsForPatchAndPost() {
    const itemsForPatch: {
      custom_status_id?: number | undefined;
      name: string;
      color: string;
    }[] = [];
    const itemsForPost: {
      custom_status_id?: number | undefined;
      name: string;
      color: string;
    }[] = [];

    this.getBody().forEach((item) => {
      if (item.custom_status_id !== undefined) {
        itemsForPatch.push(item);
      } else {
        itemsForPost.push(item);
      }
    });

    return { itemsForPatch, itemsForPost };
  }

  private async getCustomStatuses(campaignId: number) {
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
      .where(function () {
        this.where("wp_ug_bug_custom_status.campaign_id", campaignId)
          .andWhere("wp_ug_bug_custom_status.is_default", 0)
          .orWhere(function () {
            this.whereNull("wp_ug_bug_custom_status.campaign_id").andWhere(
              "wp_ug_bug_custom_status.is_default",
              1
            );
          });
      })
      .orderBy("wp_ug_bug_custom_status.phase_id", "asc")
      .orderBy("wp_ug_bug_custom_status.id", "asc");

    const customStatuses = results.map((result) => ({
      id: result.id,
      name: result.name,
      phase: {
        id: result.phase_id,
        name: result.phase_name,
      },
      color: result.color,
      is_default: result.is_default,
    }));

    return customStatuses;
  }

  private async editOrCreateCustomStatuses() {
    const { itemsForPatch, itemsForPost } = this.getItemsForPatchAndPost();

    if (itemsForPatch.length > 0) {
      await Promise.all(
        itemsForPatch.map((item) => {
          return unguess.tables.WpUgBugCustomStatus.do()
            .where("custom_status_id", item.custom_status_id)
            .update({ name: item.name, color: item.color });
        })
      );
    }
    if (itemsForPost.length > 0) {
      await Promise.all(
        itemsForPost.map((item) => {
          return unguess.tables.WpUgBugCustomStatus.do().insert({
            campaign_id: this.cp_id,
            name: item.name,
            color: item.color,
            is_default: 0,
            phase_id: 1,
          });
        })
      );
    }
    return await this.getCustomStatuses(this.cp_id);
  }
}
