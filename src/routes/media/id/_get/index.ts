/** OPENAPI-CLASS: get-media-id */

import { tryber } from "@src/features/database";
import Route from "@src/features/routes/Route";
import { getPresignedUrl } from "@src/features/s3/getPresignedUrl";
import jwtSecurityHandler from "@src/middleware/jwtSecurityHandler";
import { JwtPayload } from "jsonwebtoken";

const temporaryErrorPage = "https://app.unguess.io/error";
export default class GetMedia extends Route<{
  response: void;
  parameters: StoplightOperations["get-media-id"]["parameters"]["path"];
}> {
  private mediaUrl: string;
  private _media: { id: number; location: string; bug_id: number } | undefined;
  private campaignId: number = 0;
  private user: { tryber_wp_user_id: number } | undefined;

  protected constructor(configuration: RouteClassConfiguration) {
    super(configuration);
    const { id } = this.getParameters();
    this.mediaUrl = atob(id);
  }

  protected async init(): Promise<void> {
    const media = await this.initMedia();
    if (!media) {
      const error = new Error("Media not found") as OpenapiError;
      this.setError(403, error);
      throw error;
    }
    this._media = media;
    this.campaignId = await this.getCampaignId();
    const user = await jwtSecurityHandler(
      this.configuration.context,
      this.configuration.request,
      this.configuration.response
    );
    if (user && typeof user === "object" && "tryber_wp_user_id" in user)
      this.user = { tryber_wp_user_id: user.tryber_wp_user_id };
  }

  protected async initMedia() {
    return await tryber.tables.WpAppqEvdBugMedia.do()
      .select("id", "location", "bug_id")
      .where("location", this.mediaUrl)
      .first();
  }
  protected async getCampaignId() {
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
      this.setRedirect("https://app.unguess.io/login");
      return false;
    }
    if (await this.hasNoAccess() /*&& this.userIsNotAdmin()*/) {
      this.setRedirect(temporaryErrorPage);
      return false;
    }

    return true;
  }
  protected async prepare(): Promise<void> {
    this.setRedirect(await getPresignedUrl(this.media.location));
  }

  protected isLoggedOut() {
    return !this.user;
  }

  protected async bugIsPublic() {
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
        const differenceInDays = Math.floor(
          differenceInMilliseconds / (1000 * 60 * 60 * 24)
        );
        return differenceInDays < bug.expiration;
      }).length > 0
    );
  }

  protected async hasNoAccess() {
    if (await this.hasCampaignAccess()) return false;
    //if (await this.hasProjectAccess()) return false;
    //if (await this.hasWorkspaceAccess()) return false;
    return true;
  }

  private async hasCampaignAccess() {
    if (!this.user) return false;
    let campaignAccess = await tryber.tables.WpAppqUserToCampaign.do()
      .select()
      .where("campaign_id", this.campaignId)
      .andWhere("wp_user_id", this.user.tryber_wp_user_id);
    return campaignAccess.length > 0;
  }
}
