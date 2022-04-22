import * as db from "@src/features/db";
import { ERROR_MESSAGE } from "@src/routes/shared";

export default async (
  projectId: number,
  user: UserType
): Promise<StoplightComponents["schemas"]["Project"]> => {
  let error = {
    message: ERROR_MESSAGE,
    error: true,
    code: 400,
  } as StoplightComponents["schemas"]["Error"];

  // Check parameters
  if (!projectId) throw error;

  // Check user
  if (user.role !== "administrator") {
    if (!user.id) throw error;

    const projectSql = db.format(
      `SELECT p.* FROM wp_appq_project p
        JOIN wp_appq_customer c ON (c.id = p.customer_id)
        JOIN wp_appq_user_to_customer uc ON (uc.customer_id = c.id)
      WHERE p.id = ? AND uc.wp_user_id = ?`,
      [projectId, user.id]
    );

    let project = await db.query(projectSql);

    console.log("project", project);

    if (!project.length) throw { ...error, code: 403 };

    project = project[0];

    const userToProjectSql = db.format(
      `SELECT wp_user_id FROM wp_appq_user_to_project WHERE project_id = ?`,
      [projectId]
    );

    const userToProject = await db.query(userToProjectSql);

    if (userToProject.length) {
      let isAllowed = false;
      userToProject.forEach((limit: { wp_user_id: number }) => {
        if (limit.wp_user_id === user.id) isAllowed = true;
      });

      if (!isAllowed) throw { ...error, code: 403 };

      return await formatProject(project);
    } else {
      //No limited users, we can safely return the project
      return await formatProject(project);
    }
  } else {
    //Get the project
    const projectSql = db.format(
      `SELECT p.* FROM wp_appq_project p WHERE p.id = ?`,
      [projectId]
    );

    let project = await db.query(projectSql);

    if (!project.length) throw { ...error, code: 403 };

    return await formatProject(project[0]);
  }
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
  };
};
