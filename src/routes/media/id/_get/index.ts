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

    if (await this.isLoggedOut()) {
      this.setRedirect("https://app.unguess.io/login");
      return false;
    }

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
}
