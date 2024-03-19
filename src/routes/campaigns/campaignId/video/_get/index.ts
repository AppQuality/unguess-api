/** OPENAPI-CLASS: get-campaigns-cid-video */

// import OpenapiError from "@src/features/OpenapiError";
import { checkUrl } from "@src/features/checkUrl";
import { tryber } from "@src/features/database";
import CampaignRoute from "@src/features/routes/CampaignRoute";
import { mapToDistribution } from "@src/features/s3/mapToDistribution";
export default class GetCampaignVideo extends CampaignRoute<{
  response: StoplightOperations["get-campaigns-cid-video"]["responses"]["200"]["content"]["application/json"];
  parameters: StoplightOperations["get-campaigns-cid-video"]["parameters"]["path"];
}> {
  protected async prepare(): Promise<void> {
    return this.setSuccess(200, {
      items: await this.getVideos(),
    });
  }

  private async getVideos() {
    const query = tryber.tables.WpAppqUserTaskMedia.do()
      .select(
        tryber.ref("id").withSchema("wp_appq_user_task_media").as("media_id"),
        tryber
          .ref("location")
          .withSchema("wp_appq_user_task_media")
          .as("media_url"),

        tryber.ref("id").withSchema("wp_appq_evd_profile").as("tester_id"),
        tryber.ref("name").withSchema("wp_appq_evd_profile").as("tester_name")
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
    const videos = await query;

    const results = [];
    for (const video of videos) {
      const stream = video.media_url.replace(".mp4", "-stream.m3u8");
      const isValidStream = await checkUrl(stream);
      results.push({
        id: video.media_id,
        url: mapToDistribution(video.media_url),
        streamUrl: isValidStream ? mapToDistribution(stream) : undefined,
        tester: { id: video.tester_id, name: video.tester_name },
      });
    }

    return results;
  }
}
