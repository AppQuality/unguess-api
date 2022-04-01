import * as db from "@src/features/db";

export default async (workspaceId: number): Promise<Workspace | {}> => {
  try {
    const sql = db.format(
      `SELECT * FROM wp_appq_customer c 
            WHERE c.id = ? `,
      [workspaceId]
    );

    let workspace = await db.query(sql, "tryber");

    if (workspace.length) {
      workspace = workspace[0];

      return {
        id: workspace.id,
        company: workspace.company,
        logo: workspace.company_logo,
        tokens: workspace.tokens,
      };
    }

    throw Error("No workspace found");
  } catch (error) {
    throw error;
  }
};
