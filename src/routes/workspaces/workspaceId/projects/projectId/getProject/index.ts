import * as db from "@src/features/db";
import getUserProjects from "@src/routes/workspaces/workspaceId/getUserProjects";

export default async (
  projectId: number,
  workspaceId: number,
  user: UserType
): Promise<StoplightComponents["schemas"]["Project"]> => {
  try {
    // Check parameters
    if (projectId == null || projectId <= 0) {
      throw Error("Bad request");
    }

    if (workspaceId == null || workspaceId <= 0) {
      throw Error("Bad request");
    }

    // Get project
    const sql = db.format(
      `SELECT p.id, p.display_name FROM wp_appq_project p WHERE p.id = ? AND p.customer_id = ?`,
      [projectId, workspaceId]
    );

    let project = await db.query(sql);

    if (project.length) {
      project = project[0];

      const userProjects = await getUserProjects(workspaceId, user);
      if (!userProjects.length) {
        throw Error("You have no permission");
      }

      // Get campaigns count
      const campaignsSql =
        "SELECT COUNT(*) AS count FROM wp_appq_evd_campaign WHERE project_id = ?";
      let campaigns = await db.query(db.format(campaignsSql, [project.id]));

      return {
        id: project.id,
        name: project.display_name,
        campaigns_count: campaigns[0].count,
      };
    }

    throw Error("No project found");
  } catch (error) {
    throw error;
  }
};
