import * as db from "@src/features/db";

export const getTitleRule = async (campaignId: number): Promise<boolean> => {
  const result = await db.query(
    db.format(
      `
      SELECT meta_value 
      FROM wp_appq_cp_meta 
      WHERE campaign_id = ? 
        AND meta_key = 'bug_title_rule' AND meta_value = 1; `,
      [campaignId]
    )
  );
  return !!result.length;
};

export const getBugTitle = ({
  bugTitle,
  hasTitleRule,
}: {
  bugTitle: string;
  hasTitleRule?: boolean;
}): StoplightComponents["schemas"]["BugTitle"] => {
  const formattedBugTitle = {
    full: bugTitle,
    compact: bugTitle,
  };

  if (hasTitleRule) {
    if (!bugTitle.match(/\[(.*?)\]/)) return formattedBugTitle;
    return {
      ...formattedBugTitle,
      compact: bugTitle
        .replace(bugTitle.match(/\[(.*?)\]/g)!?.join(""), "")
        .replace("-", "")
        .trim(),
      context: bugTitle
        .match(/\[(.*?)\]/g)
        ?.map((item) => item.replace(/[\[\]]/g, "")),
    };
  }

  return formattedBugTitle;
};
