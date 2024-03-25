/** OPENAPI-CLASS: get-campaigns-cid-videotags */

import { tryber } from "@src/features/database";
import CampaignRoute from "@src/features/routes/CampaignRoute";

export default class GetVideoTags extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-videotags"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-videotags"]["parameters"]["path"];
}> {
  private tagsGroups: { id: number; name: string }[] = [];
  private tagUsage: { tagId: number; usageNumber: number }[] = [];

  protected async init() {
    await super.init();
    this.tagsGroups = await this.getTagsGroups();
    this.tagUsage = await this.getTagUsage();
  }

  protected async prepare(): Promise<void> {
    return this.setSuccess(200, await this.getGroupedTags());
  }

  private async getGroupedTags() {
    const items = [];
    const tags = await this.getCampaignTags();
    for (const group of this.tagsGroups) {
      items.push({
        group,
        tags: tags
          .filter((tag) => tag.groupId === group.id)
          .map((tag) => ({
            id: tag.id,
            name: tag.name,
            color: tag.color,
            usageNumber:
              this.tagUsage.find((usage) => usage.tagId === tag.id)
                ?.usageNumber || 0,
          })),
      });
    }
    return items;
  }

  protected async getCampaignTags() {
    const tags = await tryber.tables.WpAppqUsecaseMediaObservationsTags.do()
      .select(
        tryber.ref("id").withSchema("wp_appq_usecase_media_observations_tags"),
        tryber
          .ref("name")
          .withSchema("wp_appq_usecase_media_observations_tags"),
        tryber
          .ref("style")
          .withSchema("wp_appq_usecase_media_observations_tags")
          .as("color"),
        tryber
          .ref("id")
          .withSchema("wp_appq_usecase_media_tag_type")
          .as("groupId")
      )
      .join(
        "wp_appq_usecase_media_tag_type",
        "wp_appq_usecase_media_tag_type.id",
        "wp_appq_usecase_media_observations_tags.type"
      )
      .where("campaign_id", this.cp_id);
    if (!tags) return [];
    return tags;
  }

  private async getTagsGroups() {
    const tagsGroups = await tryber.tables.WpAppqUsecaseMediaTagType.do()
      .select("id", "name")
      .where("campaign_id", this.cp_id);
    if (!tagsGroups) return [];

    return tagsGroups;
  }

  private async getTagUsage() {
    const tagsUsage =
      await tryber.tables.WpAppqUsecaseMediaObservationsTagsLink.do()
        .select(
          tryber
            .ref("tag_id")
            .withSchema("wp_appq_usecase_media_observations_tags_link")
            .as("tagId")
        )
        .count("tag_id", { as: "usageNumber" })
        .join(
          "wp_appq_usecase_media_observations_tags",
          "wp_appq_usecase_media_observations_tags.id",
          "wp_appq_usecase_media_observations_tags_link.tag_id"
        )
        .join(
          "wp_appq_usecase_media_tag_type",
          "wp_appq_usecase_media_tag_type.id",
          "wp_appq_usecase_media_observations_tags.type"
        )
        .groupBy("tag_id")
        .where("campaign_id", this.cp_id);
    if (!tagsUsage) return [];

    return tagsUsage.map((tag) => ({
      tagId: tag.tagId,
      usageNumber: Number(tag.usageNumber),
    }));
  }
}
