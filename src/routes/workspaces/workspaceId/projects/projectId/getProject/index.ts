import * as db from "@src/features/db";
import { ERROR_MESSAGE } from "@src/routes/shared";

export default async (
  projectId: number,
  workspaceId: number
): Promise<
  | StoplightComponents["schemas"]["Project"]
  | Promise<StoplightComponents["schemas"]["Error"]>
> => {
  let error = {
    message: ERROR_MESSAGE,
  } as StoplightComponents["schemas"]["Error"];
  try {
    // Check parameters
    if (projectId == null || projectId <= 0) {
      error.code = 400;
      return error;
    }

    if (workspaceId == null || workspaceId <= 0) {
      error.code = 400;
      return error;
    }

    // Get project
    const sql = db.format(
      `SELECT p.id, p.display_name FROM wp_appq_project p WHERE p.id = ? AND p.customer_id = ?`,
      [projectId, workspaceId]
    );

    let project = await db.query(sql);

    if (project.length) {
      project = project[0];

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

    error.code = 404;
    return error;
  } catch (e) {
    error.code = 500;
    return error;
  }
};
