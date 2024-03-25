import OpenapiError from "@src/features/OpenapiError";
import busboyMapper, { InvalidMedia } from "@src/features/busboyMapper";
import { unguess } from "@src/features/database";
import BugCommentRoute from "@src/features/routes/BugCommentRoute";
import { getPresignedUrl } from "@src/features/s3/getPresignedUrl";
import upload from "@src/features/s3/upload";
import path from "path";

type UploadFile =
  StoplightOperations["post-campaigns-cid-bugs-bid-comments-cmid-media"]["responses"]["200"]["content"]["application/json"]["files"][number];

/** OPENAPI-CLASS: post-campaigns-cid-bugs-bid-comments-cmid-media */
export default class MediaRoute extends BugCommentRoute<{
  response: StoplightOperations["post-campaigns-cid-bugs-bid-comments-cmid-media"]["responses"]["200"]["content"]["application/json"];
  body: StoplightOperations["post-campaigns-cid-bugs-bid-comments-cmid-media"]["requestBody"]["content"]["multipart/form-data"];
  parameters: StoplightOperations["post-campaigns-cid-bugs-bid-comments-cmid-media"]["parameters"]["path"];
}> {
  private validMedia: Media[] = [];
  private invalidMedia: InvalidMedia[] = [];

  protected async init() {
    await super.init();
    const { valid, invalid } = await this.mapFiles();
    this.validMedia = valid;
    this.invalidMedia = invalid;
  }

  private async mapFiles() {
    try {
      return await busboyMapper(this.configuration.request, (file) => {
        if (!isAcceptableFile(file)) {
          return "INVALID_FILE_EXTENSION";
        }
        return false;
      });
    } catch (err) {
      this.setError(404, err as OpenapiError);
      throw new OpenapiError("Invalid request body");
    }
    function isAcceptableFile(file: { name: string }): boolean {
      return ![".bat", ".sh", ".exe"].includes(
        path.extname(file.name).toLowerCase()
      );
    }
  }

  protected async prepare() {
    const uploadedFiles = await this.uploadFiles();
    await this.saveMedia(uploadedFiles);

    this.setSuccess(200, {
      files: await this.signFiles(uploadedFiles),
      failed: this.invalidMedia.length ? this.invalidMedia : undefined,
    });
  }

  private async uploadFiles(): Promise<UploadFile[]> {
    const files = this.validMedia;
    const testerId = this.getProfileId();
    let uploadedFiles = [];
    for (const media of files) {
      uploadedFiles.push({
        name: media.name,
        path: (
          await upload({
            bucket: process.env.COMMENTS_MEDIA_BUCKET || "bucket",
            key: `${process.env.ENVIRONMENT}/T${testerId}/${path.basename(
              media.name,
              path.extname(media.name)
            )}_${new Date().getTime()}${path.extname(media.name)}`,
            file: media,
          })
        ).toString(),
      });
    }
    return uploadedFiles;
  }

  private async saveMedia(uploadedFiles: UploadFile[]) {
    if (!uploadedFiles.length) return;

    await unguess.tables.UgBugsCommentsMedia.do().insert(
      uploadedFiles.map((file) => ({
        comment_id: this.comment_id,
        url: file.path,
        uploader: this.getProfileId(),
      }))
    );
  }

  private async signFiles(uploadedFiles: UploadFile[]) {
    const signedFiles: UploadFile[] = [];

    for (const file of uploadedFiles) {
      signedFiles.push({
        ...file,
        path: await getPresignedUrl(file.path),
      });
    }

    return signedFiles;
  }
}
