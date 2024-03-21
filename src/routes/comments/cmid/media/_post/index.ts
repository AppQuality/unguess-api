import busboyMapper from "@src/features/busboyMapper";
import debugMessage from "@src/features/debugMessage";
import upload from "@src/features/s3/upload";
import { Context } from "openapi-backend";
import path from "path";

/** OPENAPI-ROUTE: post-comments-cmid-media */
export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  try {
    const { valid, invalid } = await busboyMapper(req, (file) => {
      if (!isAcceptableFile(file)) {
        return "INVALID_FILE_EXTENSION";
      }
      return false;
    });
    res.status_code = 200;
    return {
      files: await uploadFiles(valid, req.user.profile_id),
      failed: invalid.length ? invalid : undefined,
    };
  } catch (err) {
    debugMessage(err);
    res.status_code = 404;
    return {
      element: "media-upload",
      id: 0,
      message: (err as OpenapiError).message,
    };
  }

  function getKey({
    testerId,
    filename,
    extension,
  }: {
    testerId: number;
    filename: string;
    extension: string;
  }): string {
    return `${process.env.COMMENTS_MEDIA_BUCKET || "unguess-comments-media"}/${
      process.env.ENVIRONMENT
    }/T${testerId}/${filename}_${new Date().getTime()}${extension}`;
  }

  function isAcceptableFile(file: { name: string }): boolean {
    return ![".bat", ".sh", ".exe"].includes(
      path.extname(file.name).toLowerCase()
    );
  }

  async function uploadFiles(
    files: Media[],
    testerId: number
  ): Promise<
    StoplightOperations["post-comments-cmid-media"]["responses"]["200"]["content"]["application/json"]["files"]
  > {
    let uploadedFiles = [];
    for (const media of files) {
      uploadedFiles.push({
        name: media.name,
        path: (
          await upload({
            bucket: process.env.COMMENTS_MEDIA_BUCKET || "",
            key: getKey({
              testerId: testerId,
              filename: path.basename(media.name, path.extname(media.name)),
              extension: path.extname(media.name),
            }),
            file: media,
          })
        ).toString(),
      });
    }
    return uploadedFiles;
  }
};
