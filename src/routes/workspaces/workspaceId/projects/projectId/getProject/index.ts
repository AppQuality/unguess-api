import * as db from "@src/features/db";

export default async (projectId: number): Promise<Project | {}> => {
  try {
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
      };
    }

    throw Error("No workspace found");
  } catch (error) {
    throw error;
  }
};
