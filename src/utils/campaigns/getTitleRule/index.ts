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

    let res = {
      ...formattedBugTitle,
      compact: bugTitle
        .replace(bugTitle.match(/\[(.*?)\]/)![0], "")
        .replace("-", "")
        .trim(),
      context: [bugTitle.match(/\[(.*?)\]/)![1]],
    };
    while (res.compact.match(/\[(.*?)\]/)) {
      const newContext = res.compact.match(/\[(.*?)\]/)![0].trim();
      res.context.push(res.compact.match(/\[(.*?)\]/)![1]);
      res.compact = res.compact.replace(newContext, "").trim();
    }
    console.log(res);
    return res;
  }

  return formattedBugTitle;
};
