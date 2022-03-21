import * as db from "@src/features/db";

export default async (
  workspaceId: number,
  userId: number
): Promise<Workspace | {}> => {
  try {
    const sql = db.format(
      `SELECT * FROM wp_appq_customer c 
            JOIN wp_appq_user_to_customer utc ON (c.id = utc.customer_id) 
            WHERE c.id = ? 
            AND utc.wp_user_id = ?`,
      [workspaceId, userId]
    );

    console.log(">>>> sql", sql);

    let workspace = await db.query(sql, "tryber");

    console.log(">>>> workspace", workspace);

    if (workspace.length) {
      workspace = workspace[0];

      return {
        id: workspace.id,
        company: workspace.company,
        logo: workspace.company_logo,
        tokens: workspace.tokens,
      };
    }

    if (!workspace.length) throw Error("No workspace found");
    return {};
  } catch (error) {
    throw error;
  }
};
