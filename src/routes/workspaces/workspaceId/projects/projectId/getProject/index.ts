import * as db from "@src/features/db";

export default async (projectId: number): Promise<Project | {}> => {
  try {
    // TODO: add join with campaigns to get the campaigns_count value
    const sql = db.format(
      `SELECT * FROM wp_appq_project p 
            WHERE p.id = ? `,
      [projectId]
    );

    let project = await db.query(sql, "tryber");

    if (project.length) {
      project = project[0];

      return {
        id: project.id,
        name: project.display_name,
        // TODO: add campaigns_count
      };
    }

    throw Error("No workspace found");
  } catch (error) {
    throw error;
  }
};
