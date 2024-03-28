/** OPENAPI-CLASS: get-video-vid */

import { checkUrl } from "@src/features/checkUrl";
import { tryber } from "@src/features/database";
import VideoRoute from "@src/features/routes/VideoRoute";
import { mapToDistribution } from "@src/features/s3/mapToDistribution";
import { th } from "date-fns/locale";

export default class GetCampaignVideo extends VideoRoute<{
  response: StoplightOperations["get-video-vid"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-video-vid"]["parameters"]["path"];
}> {
  private usecase: { id: number; name: string } = { id: 0, name: "" };

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    const query = this.getQuery();
  }
  protected async init() {
    await super.init();
    this.usecase = await this.getUsecase();
  }
  protected async prepare(): Promise<void> {
    return this.setSuccess(200, await this.getFormattedVideo());
  }

  private async getFormattedVideo() {
    const video = await this.getVideo();
    const res = {
      id: video.id,
      url: video.url,
      streamUrl: video.streamUrl,
      tester: video.tester,
      usecase: this.usecase,
      campaign: { id: this.campaign_id, name: video.campaignName },
    };
    return res;
  }

  private async getVideo() {
    const video = await tryber.tables.WpAppqUserTaskMedia.do()
      .select(
        tryber.ref("id").withSchema("wp_appq_user_task_media").as("mediaId"),
        tryber
          .ref("location")
          .withSchema("wp_appq_user_task_media")
          .as("mediaUrl"),

        tryber.ref("id").withSchema("wp_appq_evd_profile").as("testerId"),
        tryber.ref("name").withSchema("wp_appq_evd_profile").as("testerName"),
        tryber.ref("id").withSchema("wp_appq_campaign_task").as("usecaseId"),
        tryber
          .ref("title")
          .withSchema("wp_appq_evd_campaign")
          .as("campaignName")
      )
      .join(
        "wp_appq_campaign_task",
        "wp_appq_user_task_media.campaign_task_id",
        "wp_appq_campaign_task.id"
      )
      .join(
        "wp_appq_evd_profile",
        "wp_appq_user_task_media.tester_id",
        "wp_appq_evd_profile.id"
      )
      .join(
        "wp_appq_evd_campaign",
        "wp_appq_campaign_task.campaign_id",
        "wp_appq_evd_campaign.id"
      )
      .where("wp_appq_user_task_media.id", this.video_id)
      .andWhere("wp_appq_user_task_media.status", 2)
      .andWhere("wp_appq_user_task_media.location", "like", "%.mp4")
      .first();

    if (!video) throw new Error("Video not found");

    const stream = video.mediaUrl.replace(".mp4", "-stream.m3u8");
    const isValidStream = await checkUrl(stream);
    const result = {
      id: video.mediaId,
      url: mapToDistribution(video.mediaUrl),
      streamUrl: isValidStream ? mapToDistribution(stream) : undefined,
      tester: { id: video.testerId, name: video.testerName },
      usecaseId: video.usecaseId,
      campaignName: video.campaignName,
    };

    return result;
  }

  private async getUsecase() {
    const usecase = await tryber.tables.WpAppqCampaignTask.do()
      .select(
        tryber.ref("id").withSchema("wp_appq_campaign_task"),
        tryber.ref("title").withSchema("wp_appq_campaign_task").as("name")
      )
      .where("id", this.usecase_id)
      .first();
    if (typeof usecase === "undefined") throw new Error("Invalid usecase");

    return usecase;
  }
}
