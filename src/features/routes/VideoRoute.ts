import ProjectRoute from "./ProjectRoute";
import { tryber } from "../database";

type VideoRouteParameters = { vid: string };

export type { VideoRouteParameters };

export default class VideoRoute<
  T extends RouteClassTypes & {
    parameters: T["parameters"] & VideoRouteParameters;
  }
> extends ProjectRoute<T> {
  protected video_id: number;
  protected campaign_id: number;
  protected project_id: number;

  constructor(configuration: RouteClassConfiguration) {
    super(configuration);

    const params = this.getParameters();

    if (!params?.vid) throw new Error("Missing video id");
    this.video_id = Number(params.vid);
    this.campaign_id = 0;
    this.project_id = 0;
  }

  protected async init(): Promise<void> {
    if (isNaN(this.video_id)) {
      this.setError(400, {
        code: 400,
        message: "Invalid video id",
      } as OpenapiError);

      throw new Error("Invalid video id");
    }

    const video = await this.initVideo();

    if (!video) {
      this.setError(400, {
        code: 400,
        message: "Video not found",
      } as OpenapiError);

      throw new Error("Video not found");
    }
    const cpData = await this.initCpdata();
    this.campaign_id = cpData.campaignId;
    this.project_id = cpData.projectId;
    await super.init();
  }

  private async initVideo() {
    const video = await tryber.tables.WpAppqUserTaskMedia.do()
      .select(
        tryber.ref("id").withSchema("wp_appq_user_task_media"),
        tryber
          .ref("campaign_id")
          .withSchema("wp_appq_campaign_task")
          .as("cpId"),
        tryber
          .ref("location")
          .withSchema("wp_appq_user_task_media")
          .as("mediaUrl"),

        tryber.ref("id").withSchema("wp_appq_evd_profile").as("testerId"),
        tryber.ref("name").withSchema("wp_appq_evd_profile").as("testerName"),
        tryber.ref("id").withSchema("wp_appq_campaign_task").as("usecaseId")
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
      .where("wp_appq_user_task_media.id", this.video_id)
      .andWhere("wp_appq_user_task_media.status", 2)
      .andWhere("wp_appq_user_task_media.location", "like", "%.mp4")
      .first();

    if (!video) return false;

    return video;
  }

  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) {
      // The user does NOT have access to the workspace or project
      const access = await this.checkCpAccess();

      if (!access) {
        this.setError(403, {
          code: 403,
          message: "Video not found or not accessible",
        } as OpenapiError);

        return false;
      }
      return true;
    }

    // The user HAS access to the workspace or project
    return true;
  }

  private async checkCpAccess(): Promise<boolean> {
    const hasAccess = await tryber.tables.WpAppqUserToCampaign.do()
      .select()
      .where({
        campaign_id: this.campaign_id,
        wp_user_id: this.getUser().tryber_wp_user_id,
      })
      .first();

    if (!hasAccess) {
      this.setError(403, {
        code: 400,
        message: "You don't have access to this video",
      } as OpenapiError);
      return false;
    }

    return true;
  }

  protected async initCpdata() {
    const cp = await tryber.tables.WpAppqUserTaskMedia.do()
      .select(
        tryber
          .ref("campaign_id")
          .withSchema("wp_appq_campaign_task")
          .as("campaignId"),
        tryber
          .ref("project_id")
          .withSchema("wp_appq_evd_campaign")
          .as("projectId")
      )
      .join(
        "wp_appq_campaign_task",
        "wp_appq_user_task_media.campaign_task_id",
        "wp_appq_campaign_task.id"
      )
      .join(
        "wp_appq_evd_campaign",
        "wp_appq_campaign_task.campaign_id",
        "wp_appq_evd_campaign.id"
      )
      .where("wp_appq_user_task_media.id", this.video_id)
      .andWhere("wp_appq_user_task_media.status", 2)
      .first();

    if (typeof cp === "undefined") throw new Error("Invalid campaign");
    return cp;
  }
}
