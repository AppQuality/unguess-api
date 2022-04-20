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

  console.log("getProjectById", projectId, user);

  // Check parameters
  if (!projectId) throw error;

  // Check user
  if (user.role !== "administrator") {
    if (!user.id) throw error;

    const projectSql = db.format(
      `SELECT p.* FROM wp_appq_project 
        JOIN wp_appq_customer c ON (c.id = p.customer_id)
        JOIN wp_appq_user_to_customer uc ON (uc.customer_id = c.id)
      WHERE p.id = ? AND uc.wp_user_id = ?`,
      [projectId, user.id]
    );

    let project = await db.query(projectSql);

    if (!project.length) throw error;

    project = project[0];

    const userToProjectSql = db.format(
      `SELECT wp_user_id FROM wp_appq_user_to_project WHERE project_id = ?`,
      [projectId]
    );

    const userToProject = await db.query(userToProjectSql);

    if (userToProject.length) {
      console.log("userToProject", userToProject);
      //We have to check if the current user is in the project

      return project;
    } else {
      return project;
    }
  } else {
    //Get the project
    const projectSql = db.format(
      `SELECT p.* FROM wp_appq_project WHERE id = ?`,
      [projectId]
    );

    let project = await db.query(projectSql);

    if (!project.length) throw error;

    return project[0];
  }
};
