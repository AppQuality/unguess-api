import * as db from "@src/features/db";
import { ERROR_MESSAGE } from "@src/routes/shared";

export default async (
  projectId: number,
  workspaceId: number
): Promise<StoplightComponents["schemas"]["Project"]> => {
  let error = {
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Check parameters
  if (projectId == null || projectId <= 0) throw { ...error, code: 400 };

  if (workspaceId == null || workspaceId <= 0) throw { ...error, code: 400 };

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

  throw { ...error, code: 403 };
};
