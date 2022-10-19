import * as db from "@src/features/db";

interface BugMedia {
  type: string;
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
      type: {
        type: result.type as StoplightComponents["schemas"]["BugMedia"]["type"]["type"],
        extension: result.location.split(".").pop()?.toLowerCase() || "-",
      },
      url: result.location,
      creation_date: result.uploaded,
    });
  });

  return media;
};
