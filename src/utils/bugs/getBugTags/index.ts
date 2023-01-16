import * as db from "@src/features/db";

export const getBugTags = async (
  bugId: number
): Promise<StoplightComponents["schemas"]["BugTag"][] | false> => {
  const results: {
    id: number;
    tag_id: number;
    name: string;
    slug: string;
    bug_id: number;
    campaign_id: number;
    author_wp_id: number;
    author_tid: number;
    creation_date: string;
    is_visible_to_customer: number;
  }[] = await db.query(
    db.format(
      `SELECT id, tag_id, display_name as name, slug, bug_id, campaign_id, author_wp_id, author_tid, 
        creation_date, is_public as is_visible_to_customer
       from wp_appq_bug_taxonomy
       WHERE bug_id = ? and is_public=1;`,
      [bugId]
    )
  );

  // Check if bug exists
  if (!results) {
    return false;
  }

  return results.map((item) => {
    return { ...item, creation_date: item.creation_date.toString() };
  });
};
