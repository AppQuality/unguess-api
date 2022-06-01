/** OPENAPI-ROUTE: get-workspace-projects */
import { Context } from "openapi-backend";
import * as db from "@src/features/db";
import getWorkspace from "@src/utils/getWorkspace";
import { paginateItems, formatCount } from "@src/utils/paginateItems";
import {
  ERROR_MESSAGE,
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
} from "@src/utils/consts";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;
  let error = {
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  res.status_code = 200;

  let wid = parseInt(c.request.params.wid as string);

  let limit = c.request.query.limit
    ? parseInt(c.request.query.limit as string)
    : (LIMIT_QUERY_PARAM_DEFAULT as StoplightComponents["parameters"]["limit"]);
  let start = c.request.query.start
    ? parseInt(c.request.query.start as string)
    : (START_QUERY_PARAM_DEFAULT as StoplightComponents["parameters"]["start"]);
  let total;

  try {
    // Get workspace
    await getWorkspace(wid, user);

    // Get workspace projects
    let projects: Array<{
      id: number;
      display_name: string;
    }> = [];

    // Get customer's projects
    let projectSql = `SELECT id, display_name FROM wp_appq_project WHERE customer_id = ? ORDER BY id`;

    if (limit) {
      projectSql += ` LIMIT ${limit} OFFSET ${start}`;
    }

    projects = await db.query(db.format(projectSql, [wid]));

    // Count projects
    const countQuery = `SELECT COUNT(*) FROM wp_appq_project WHERE customer_id = ?`;
    total = await db.query(db.format(countQuery, [wid]));
    total = formatCount(total);

    let returnProjects: Array<StoplightComponents["schemas"]["Project"]> = [];
    if (projects) {
      for (const project of projects) {
        if (user.role !== "administrator") {
          // Check if user can see this project
          let hasPermission = false;
          const userToProjectSql =
            "SELECT * FROM wp_appq_user_to_project WHERE project_id = ?";
          let userToProjectRows: Array<{
            wp_user_id: number;
            project_id: number;
          }> = await db.query(db.format(userToProjectSql, [project.id]));

          if (userToProjectRows.length) {
            // Check if the wp_user_id is in the userToProjectRows array
            for (const userToProjectRow of userToProjectRows) {
              if (userToProjectRow.wp_user_id == user.id) {
                // The user has permission to see this project
                hasPermission = true;
                break;
              }
            }
          } else {
            // The project has no permission limits
            hasPermission = true;
          }

          if (!hasPermission) {
            continue;
          }
        }

        // Get campaigns count
        let campaigns;
        try {
          const campaignSql =
            "SELECT COUNT(*) AS count FROM wp_appq_evd_campaign WHERE project_id = ?";
          campaigns = await db.query(db.format(campaignSql, [project.id]));
        } catch (e) {
          res.status_code = 500;
          error.code = 500;
          return error;
        }

        let item: StoplightComponents["schemas"]["Project"] = {
          id: project.id,
          name: project.display_name,
          campaigns_count: campaigns[0].count,
        };

        returnProjects.push(item);
      }
    }

    return paginateItems({ items: returnProjects, start, limit, total });
  } catch (e: any) {
    if (e.code) {
      error.code = e.code;
      res.status_code = e.code;
    } else {
      error.code = 500;
      res.status_code = 500;
    }

    return error;
  }
};
