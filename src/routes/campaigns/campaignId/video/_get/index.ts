/** OPENAPI-CLASS: get-campaigns-cid-video */

import { checkUrl } from "@src/features/checkUrl";
import { tryber } from "@src/features/database";
import CampaignRoute from "@src/features/routes/CampaignRoute";
import { mapToDistribution } from "@src/features/s3/mapToDistribution";

export default class GetCampaignVideo extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-video"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-video"]["parameters"]["path"];
  query: StoplightOperations["get-campaigns-cid-video"]["parameters"]["query"];
}> {
  private usecases: { id: number; title: string; description: string }[] = [];

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    const query = this.getQuery();
  }
  protected async init() {
    await super.init();
    this.usecases = await this.getUsecase();
  }
  protected async prepare(): Promise<void> {
    return this.setSuccess(200, {
      items: await this.getFormattedItems(),
      start: 0,
      size: 0,
      limit: 0,
      total: 0,
    });
  }

  private async getFormattedItems() {
    const items = [];
    const videos = await this.getVideos();
    if (!this.usecases) return [];
    for (const usecase of this.usecases) {
      items.push({
        usecase,
        videos: videos
          .filter((video) => video.usecaseId === usecase.id)
          .map((video) => ({
            id: video.id,
            url: video.url,
            streamUrl: video.streamUrl,
            tester: video.tester,
          })),
      });
    }
    return items;
  }

  private async getVideos() {
    const videos = await tryber.tables.WpAppqUserTaskMedia.do()
      .select(
        tryber.ref("id").withSchema("wp_appq_user_task_media").as("media_id"),
        tryber
          .ref("location")
          .withSchema("wp_appq_user_task_media")
          .as("media_url"),

        tryber.ref("id").withSchema("wp_appq_evd_profile").as("tester_id"),
        tryber.ref("name").withSchema("wp_appq_evd_profile").as("tester_name"),
        tryber.ref("id").withSchema("wp_appq_campaign_task").as("usecase_id")
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
      .where("wp_appq_campaign_task.campaign_id", this.cp_id)
      .andWhere("wp_appq_user_task_media.status", 2)
      .andWhere("wp_appq_user_task_media.location", "like", "%.mp4");

    const results = [];
    for (const video of videos) {
      const stream = video.media_url.replace(".mp4", "-stream.m3u8");
      const isValidStream = await checkUrl(stream);
      results.push({
        id: video.media_id,
        url: mapToDistribution(video.media_url),
        streamUrl: isValidStream ? mapToDistribution(stream) : undefined,
        tester: { id: video.tester_id, name: video.tester_name },
        usecaseId: video.usecase_id,
      });
    }
    return results;
  }

  private async getUsecase() {
    const usecases = await tryber.tables.WpAppqCampaignTask.do()
      .select("id", "title", tryber.ref("content").as("description"))
      .where("campaign_id", this.cp_id);
    if (!usecases) return [];

    return usecases;
  }
}
