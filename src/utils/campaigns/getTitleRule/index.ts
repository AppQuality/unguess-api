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
