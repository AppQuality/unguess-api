import * as db from "@src/features/db";
import { ERROR_MESSAGE } from "@src/utils/constants";

interface getProjectByIdArgs {
  user: UserType;
  projectId: number;
}

export const getProjectById = async ({
  projectId,
}: getProjectByIdArgs): Promise<StoplightComponents["schemas"]["Project"]> => {
  let error = {
    message: ERROR_MESSAGE + " with project",
    error: true,
    code: 400,
  } as StoplightComponents["schemas"]["Error"];

  // Check parameters
  if (!projectId) throw error;

  //Get the project
  const projectSql = db.format(
    `SELECT p.* FROM wp_appq_project p WHERE p.id = ?`,
    [projectId]
  );

  let project = await db.query(projectSql);

  if (!project.length) throw { ...error, code: 403 };

  return await formatProject(project[0]);
};

const formatProject = async (project: any) => {
  const campaignsCountSql =
    "SELECT COUNT(*) AS count FROM wp_appq_evd_campaign WHERE project_id = ?";
  let campaignsCount = await db.query(
    db.format(campaignsCountSql, [project.id])
  );

  return {
    id: project.id,
    name: project.display_name,
    campaigns_count: campaignsCount[0].count,
    workspaceId: project.customer_id ? Number(project.customer_id) : -1,
  };
};
