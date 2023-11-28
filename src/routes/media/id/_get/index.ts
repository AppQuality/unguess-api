/** OPENAPI-CLASS: get-media-id */

import { tryber } from "@src/features/database";
import Route from "@src/features/routes/Route";
import { getPresignedUrl } from "@src/features/s3/getPresignedUrl";
import jwtSecurityHandler from "@src/middleware/jwtSecurityHandler";

export default class GetMedia extends Route<{
  response: void;
  parameters: StoplightOperations["get-media-id"]["parameters"]["path"];
}> {
  private mediaUrl: string;
  private _media: { id: number; location: string; bug_id: number } | undefined;
  private campaignId: number = 0;
  private user:
    | { tryber_wp_user_id: number; role: "customer" | "administrator" }
    | undefined;

  protected constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    const { id } = this.getParameters();
    try {
      this.mediaUrl = atob(id);
    } catch (e) {
      this.mediaUrl = "";
    }
  }

  protected async init(): Promise<void> {
    const media = await this.initMedia();

    if (!media) {
      this.setRedirect("/media/oops");
      throw new Error("Media not found");
    }
    this._media = media;

    this.campaignId = await this.getCampaignId();

    let user;
    try {
      user = await jwtSecurityHandler(
        this.configuration.context,
        this.configuration.request,
        this.configuration.response
      );
    } catch (e) {
      console.log(e);
    }
    if (
      user &&
      typeof user === "object" &&
      "tryber_wp_user_id" in user &&
      "role" in user
    )
      this.user = {
        tryber_wp_user_id: user.tryber_wp_user_id,
        role: user.role,
      };
  }

  private async initMedia() {
    return await tryber.tables.WpAppqEvdBugMedia.do()
      .select("id", "location", "bug_id")
      .where("location", this.mediaUrl)
      .first();
  }
  private async getCampaignId() {
    const bug = await tryber.tables.WpAppqEvdBug.do()
      .select("campaign_id")
      .where("id", this.media.bug_id)
      .first();
    if (!bug) return 0;
    return bug?.campaign_id;
  }
  get media() {
    if (!this._media) throw new Error("Media not found");
    return this._media;
  }

  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) return false;

    if (await this.bugIsPublic()) return true;

    if (this.isLoggedOut()) {
      this.setRedirect("/login");
      return false;
    }
    if ((await this.hasAccess()) === false) {
      this.setRedirect("/media/oops");
      return false;
    }

    return true;
  }

  protected async prepare(): Promise<void> {
    this.setRedirect(await getPresignedUrl(this.media.location));
  }

  private isLoggedOut() {
    return !this.user;
  }

  private async bugIsPublic() {
    let bugs = await tryber.tables.WpAppqEvdBugMedia.do()
      .select(
        tryber.ref("bug_id").withSchema("wp_appq_evd_bug_media"),
        tryber.ref("creation_date").withSchema("wp_appq_bug_link"),
        tryber.ref("expiration").withSchema("wp_appq_bug_link")
      )
      .where("wp_appq_evd_bug_media.id", this.media.id)
      .join(
        "wp_appq_bug_link",
        "wp_appq_bug_link.bug_id",
        "wp_appq_evd_bug_media.bug_id"
      );

    return (
      //remove expired bugs
      bugs.filter((bug) => {
        const today = new Date();
        const creationDate = new Date(bug.creation_date);
        const differenceInMilliseconds =
          today.getTime() - creationDate.getTime();
        return differenceInMilliseconds < bug.expiration * 1000 * 60 * 60 * 24;
      }).length > 0
    );
  }

  private async hasAccess() {
    if (await this.isAdmin()) return true;
    if (await this.hasWorkspaceAccess()) return true;
    if (await this.hasProjectAccess()) return true;
    if (await this.hasCampaignAccess()) return true;
    return false;
  }

  private async isAdmin() {
    return this.user?.role === "administrator";
  }

  private async hasWorkspaceAccess() {
    if (!this.user) return false;
    let workspaceAccess = await tryber.tables.WpAppqUserToCustomer.do()
      .select(tryber.ref("wp_user_id").withSchema("wp_appq_user_to_customer"))
      .join(
        "wp_appq_project",
        "wp_appq_project.customer_id",
        "wp_appq_user_to_customer.customer_id"
      )
      .join(
        "wp_appq_evd_campaign",
        "wp_appq_evd_campaign.project_id",
        "wp_appq_project.id"
      )
      .where("wp_appq_evd_campaign.id", this.campaignId)
      .andWhere(
        "wp_appq_user_to_customer.wp_user_id",
        this.user.tryber_wp_user_id
      );
    return workspaceAccess.length > 0;
  }

  private async hasProjectAccess() {
    let projectAccess = await tryber.tables.WpAppqUserToProject.do()
      .select(tryber.ref("project_id").withSchema("wp_appq_user_to_project"))
      .join(
        "wp_appq_project",
        "wp_appq_project.id",
        "wp_appq_user_to_project.project_id"
      )
      .join(
        "wp_appq_evd_campaign",
        "wp_appq_evd_campaign.project_id",
        "wp_appq_project.id"
      )
      .where("wp_appq_evd_campaign.id", this.campaignId);
    return projectAccess.length > 0;
  }

  private async hasCampaignAccess() {
    if (!this.user) return false;
    let campaignAccess = await tryber.tables.WpAppqUserToCampaign.do()
      .select("campaign_id")
      .where("campaign_id", this.campaignId)
      .andWhere("wp_user_id", this.user.tryber_wp_user_id);
    return campaignAccess.length > 0;
  }
}
