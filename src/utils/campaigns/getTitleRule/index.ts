import * as db from "@src/features/db";

export const getTitleRule = async (campaignId: number): Promise<number> => {
  const result = await db.query(
    db.format(
      `
      SELECT meta_value 
      FROM wp_appq_cp_meta 
      WHERE campaign_id = ? 
        AND meta_key = 'bug_title_rule' `,
      [campaignId]
    )
  );
  return result.length ? parseInt(result[0].meta_value) : 0;
};

export const getFormattedContext = (
  bugTitle: string
): { context: string; contextless_title: string } | undefined => {
  if (!bugTitle.match(/\[(.*?)\]/)) return undefined;

  return {
    context: bugTitle.match(/\[(.*?)\]/)![1],
    contextless_title: bugTitle
      .replace(bugTitle.match(/\[(.*?)\]/)![0], "")
      .replace("-", "")
      .trim(),
  };
};
