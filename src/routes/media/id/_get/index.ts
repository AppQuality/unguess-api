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
  private user: UserType | JwtPayload | string | undefined;

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
    this.user = await jwtSecurityHandler(
      this.configuration.context,
      this.configuration.request,
      this.configuration.response
    );
    console.log(">>>> this.user", this.user);
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

    if (await this.bugIsPrivate()) {
      if (this.isLoggedOut()) {
        this.setRedirect("https://app.unguess.io/login");
        return false;
      } else if (await this.hasNoAccess() /*&& this.userIsNotAdmin()*/) {
        this.setRedirect(temporaryErrorPage);
        return false;
      }
    }

    return true;
  }
  protected async prepare(): Promise<void> {
    this.setRedirect(await getPresignedUrl(this.media.location));
  }

  protected isLoggedOut() {
    return !this.user;
  }

  protected async bugIsPrivate() {
    const bug = await tryber.tables.WpAppqEvdBugMedia.do()
      .select(tryber.ref("bug_id").withSchema("wp_appq_evd_bug_media"))
      .where("wp_appq_evd_bug_media.id", this.media.id)
      .join(
        "wp_appq_bug_link",
        "wp_appq_bug_link.bug_id",
        "wp_appq_evd_bug_media.bug_id"
      )
      .first();
    return !bug?.bug_id;
  }

  protected async hasNoAccess() {
    return await this.hasNoCampaignAccess();
  }

  private async hasNoCampaignAccess() {
    if (
      !(
        this.user &&
        typeof this.user === "object" &&
        "tryber_wp_user_id" in this.user
      )
    )
      return true;
    let campaignAccess = await tryber.tables.WpAppqUserToCampaign.do()
      .select()
      .where("campaign_id", this.campaignId)
      .andWhere("wp_user_id", this.user.tryber_wp_user_id)
      .first();
    if (!campaignAccess) {
      return true;
    }
    return !campaignAccess;
  }
}
