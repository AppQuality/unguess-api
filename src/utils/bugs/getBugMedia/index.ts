import * as db from "@src/features/db";
import { getPresignedUrl } from "@src/features/s3/getPresignedUrl";

interface BugMedia {
  type: StoplightComponents["schemas"]["BugMedia"]["mime_type"]["type"];
  location: string;
  uploaded: string;
}

export const getBugMedia = async (
  bugId: number
): Promise<StoplightComponents["schemas"]["BugMedia"][] | false> => {
  const results = await db.query(
    db.format(
      `SELECT id,
        type,
        location,
        uploaded
       from wp_appq_evd_bug_media
       WHERE bug_id = ?;`,
      [bugId]
    )
  );

  // Check if bug exists
  if (!results) {
    return false;
  }

  const media = [] as StoplightComponents["schemas"]["BugMedia"][];
  for (const prop in results) {
    if (Object.prototype.hasOwnProperty.call(results, prop)) {
      const result = results[prop];
      media.push({
        mime_type: {
          type: ["image", "video"].includes(result.type)
            ? result.type
            : "other",
          extension: result.location.split(".").pop()?.toLowerCase() || "-",
        },
        url: await getPresignedUrl(result.location),
        creation_date: result.uploaded.toString(),
      });
    }
  }

  return media;
};
