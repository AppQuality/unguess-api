import * as db from "@src/features/db";

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
  results.forEach((result: BugMedia) => {
    media.push({
      mime_type: {
        type: ["image", "video"].includes(result.type) ? result.type : "other",
        extension: result.location.split(".").pop()?.toLowerCase() || "-",
      },
      url: result.location,
      creation_date: result.uploaded.toString(),
    });
  });

  return media;
};
