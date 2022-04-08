import * as db from "@src/features/db";

export default async (
  workspaceId: number,
  user: UserType
): Promise<Array<Project> | []> => {
  try {
    // Check parameters
    if (workspaceId == null || workspaceId <= 0) {
      throw Error("Bad request");
    }

    if (user.id == null || user.id <= 0) {
      throw Error("Bad request");
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
  } catch (error) {
    throw error;
  }
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
