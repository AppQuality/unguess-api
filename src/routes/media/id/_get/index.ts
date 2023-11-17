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
  private _media: { id: number; location: string } | undefined;
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
  }

  protected async initMedia() {
    return await tryber.tables.WpAppqEvdBugMedia.do()
      .select("id", "location")
      .where("location", this.mediaUrl)
      .first();
  }

  get media() {
    if (!this._media) throw new Error("Media not found");
    return this._media;
  }

  protected async filter(): Promise<boolean> {
    if (!(await super.filter())) return false;

    if ((await this.isLoggedOut()) && (await this.bugIsPrivate())) {
      this.setRedirect("https://app.unguess.io/login");
      return false;
    }

    // const access = await this.checkWSAccess();

    // if (!access) {
    //   this.setError(403, {
    //     code: 403,
    //     message: "Workspace doesn't exist or not accessible",
    //   } as OpenapiError);

    //   return false;
    // }

    return true;
  }
  protected async prepare(): Promise<void> {
    this.setRedirect(await getPresignedUrl(this.media.location));
  }

  protected async isLoggedOut() {
    const user = await jwtSecurityHandler(
      this.configuration.context,
      this.configuration.request,
      this.configuration.response
    );
    return !user;
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
}
