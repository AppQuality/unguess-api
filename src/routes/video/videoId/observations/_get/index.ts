/** OPENAPI-CLASS: get-video-vid-observations */

import { tryber } from "@src/features/database";
import VideoRoute from "@src/features/routes/VideoRoute";

export default class GetVideoObservations extends VideoRoute<{
  response: StoplightOperations["get-video-vid-observations"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-video-vid-observations"]["parameters"]["path"];
}> {
  protected campaign_id: number = 0;

  protected async prepare(): Promise<void> {
    this.campaign_id = await this.getCampaignId();
    return this.setSuccess(200, await this.getFormattedItems());
  }
  protected async filter() {
    if (!(await super.filter())) return false;
    const parameters = this.getParameters();
    if (!parameters?.vid) {
      this.setError(400, {
        code: 400,
        message: "Invalid video id",
      } as OpenapiError);
      return false;
    }
    return true;
  }

  private async getFormattedItems() {
    const observations = await this.getObservations();
    if (!observations) return [];

    const observationTags = await this.getObservationsTags();

    return observations.map((observation) => ({
      id: observation.id,
      title: observation.title,
      description: observation.description,
      start: 0,
      end: 0,
      tags:
        observationTags.find(
          (current) => current.observationId === observation.id
        )?.tags || [],
    }));
  }

  private async getObservations() {
    return await tryber.tables.WpAppqUsecaseMediaObservations.do()
      .select(
        tryber.ref("id").withSchema("wp_appq_usecase_media_observations"),
        tryber
          .ref("name")
          .withSchema("wp_appq_usecase_media_observations")
          .as("title"),
        tryber
          .ref("description")
          .withSchema("wp_appq_usecase_media_observations")
      )
      .join(
        "wp_appq_user_task_media",
        "wp_appq_user_task_media.id",
        "wp_appq_usecase_media_observations.media_id"
      )
      .where("wp_appq_usecase_media_observations.media_id", this.video_id)
      .andWhere("wp_appq_user_task_media.status", 2);
  }

  protected async getObservationsTags() {
    const observationsIds = await this.getObservationsIds();
    const tags = await tryber.tables.WpAppqUsecaseMediaObservationsTags.do()
      .select(
        tryber.ref("id").withSchema("wp_appq_usecase_media_observations_tags"),
        tryber
          .ref("name")
          .withSchema("wp_appq_usecase_media_observations_tags"),
        tryber
          .ref("style")
          .withSchema("wp_appq_usecase_media_observations_tags"),
        tryber
          .ref("id")
          .withSchema("wp_appq_usecase_media_tag_type")
          .as("groupId"),
        tryber
          .ref("name")
          .withSchema("wp_appq_usecase_media_tag_type")
          .as("groupName"),
        tryber
          .ref("wp_appq_usecase_media_observations_tags_link.observation_id")
          .as("observationId")
      )
      .join(
        "wp_appq_usecase_media_tag_type",
        "wp_appq_usecase_media_tag_type.id",
        "wp_appq_usecase_media_observations_tags.type"
      )
      .join(
        "wp_appq_usecase_media_observations_tags_link",
        "wp_appq_usecase_media_observations_tags_link.tag_id",
        "wp_appq_usecase_media_observations_tags.id"
      )
      .whereIn(
        "wp_appq_usecase_media_observations_tags_link.observation_id",
        observationsIds.map((id) => id.id)
      );
    if (!tags) return [];
    const tagsUsage = await this.getTagUsage();
    let groupedTag: {
      observationId: number;
      tags: {
        group: {
          id: number;
          name: string;
        };
        tag: {
          id: number;
          name: string;
          style: string;
          usageNumber: number;
        };
      }[];
    }[] = [];
    observationsIds.forEach((observation) => {
      const observationTags = tags.filter(
        (tag) => tag.observationId === observation.id
      );
      groupedTag.push({
        observationId: observation.id,
        tags: observationTags.map((tag) => ({
          group: {
            id: tag.groupId,
            name: tag.groupName,
          },
          tag: {
            id: tag.id,
            name: tag.name,
            style: tag.style,
            usageNumber:
              tagsUsage.find((tagUsage) => tagUsage.tagId === tag.id)
                ?.usageNumber || 0,
          },
        })),
      });
    });

    return groupedTag;
  }
  private async getObservationsIds() {
    return await tryber.tables.WpAppqUsecaseMediaObservations.do()
      .select(tryber.ref("id").withSchema("wp_appq_usecase_media_observations"))
      .join(
        "wp_appq_user_task_media",
        "wp_appq_user_task_media.id",
        "wp_appq_usecase_media_observations.media_id"
      )
      .where("wp_appq_usecase_media_observations.media_id", this.video_id)
      .andWhere("wp_appq_user_task_media.status", 2);
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
        .where("campaign_id", this.campaign_id);
    if (!tagsUsage) return [];

    return tagsUsage.map((tag) => ({
      tagId: tag.tagId,
      usageNumber: Number(tag.usageNumber),
    }));
  }

  private async getCampaignId() {
    const cp = await tryber.tables.WpAppqUserTaskMedia.do()
      .select(
        tryber.ref("campaign_id").withSchema("wp_appq_campaign_task").as("id")
      )
      .join(
        "wp_appq_campaign_task",
        "wp_appq_user_task_media.campaign_task_id",
        "wp_appq_campaign_task.id"
      )
      .where("wp_appq_user_task_media.id", this.video_id)
      .first();
    if (!cp) return 0;
    return cp.id;
  }
}
