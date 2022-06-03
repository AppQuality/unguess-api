import * as db from "@src/features/db";
import { ERROR_MESSAGE } from "@src/utils/constants";

interface getUserProjectsArgs {
  user: UserType;
  workspaceId: number;
}

export const getUserProjects = async ({
  workspaceId,
  user,
}: getUserProjectsArgs): Promise<Array<Project> | []> => {
  let error = {
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Check parameters
  if (workspaceId == null || workspaceId <= 0) {
    throw { ...error, code: 400 };
  }

  if (user.id == null || user.id < 0) {
    throw { ...error, code: 400 };
  }

  // Projects sql
  let projectsSql: string;
  if (user.role === "administrator") {
    projectsSql = db.format(
      `
        SELECT p.*
        FROM wp_appq_project p
        WHERE p.customer_id = ?
      `,
      [workspaceId]
    );
  } else {
    projectsSql = db.format(
      `
        SELECT p.*, utp.wp_user_id AS limit_user_id
        FROM wp_appq_project p
        LEFT JOIN wp_appq_user_to_project utp ON (utp.project_id = p.id)
        WHERE p.customer_id = ?
      `,
      [workspaceId]
    );
  }

  let projects = await db.query(projectsSql);

  let returnProjects: Array<StoplightComponents["schemas"]["Project"]> = [];

  if (projects.length) {
    if (user.role === "administrator") {
      return await formattedProjects(projects);
    }

    projects.map((project: any) => {
      if (project.limit_user_id) {
        if (project.limit_user_id === user.tryber_wp_user_id) {
          returnProjects.push(project);
        }
      } else {
        returnProjects.push(project);
      }
    });
  }

  return await formattedProjects(returnProjects);
};

const formattedProjects = async (projects: any) => {
  let results: any = [];
  for (const project of projects) {
    const campaignsCountSql =
      "SELECT COUNT(*) AS count FROM wp_appq_evd_campaign WHERE project_id = ?";
    let campaignsCount = await db.query(
      db.format(campaignsCountSql, [project.id])
    );

    results.push({
      id: project.id,
      name: project.display_name,
      campaigns_count: campaignsCount[0].count,
    });
  }

  return results;
};
