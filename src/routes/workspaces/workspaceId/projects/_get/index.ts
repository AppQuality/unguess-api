/** OPENAPI-ROUTE: get-workspace-projects */
import { Context } from "openapi-backend";
import * as db from "../../../../../features/db";
import getWorkspace from "../../getWorkspace/";
import paginateItems, {
  formatCount,
  formatPagination,
} from "@src/paginateItems";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;

  res.status_code = 200;

  let limit = c.request.query.limit || 10;
  let start = c.request.query.start || 0;
  let total;

  const { formattedLimit, formattedStart } = await formatPagination(
    limit,
    start
  );

  limit = formattedLimit;
  start = formattedStart;

  // Get wid path parameter
  let workspaceId;
  if (typeof c.request.params.wid == "string") {
    workspaceId = parseInt(
      c.request.params.wid
    ) as StoplightOperations["get-workspace-projects"]["parameters"]["path"]["wid"];
  }

  // Check if workspaceId is valid
  if (
    typeof workspaceId == "undefined" ||
    workspaceId == null ||
    workspaceId < 0
  ) {
    res.status_code = 400;
    return "Workspace id is not valid";
  }

  // Get workspace
  let workspace;
  try {
    workspace = (await getWorkspace(
      workspaceId,
      user
    )) as StoplightComponents["schemas"]["Workspace"];
  } catch (error) {
    if ((error as OpenapiError).message == "No workspace found") {
      res.status_code = 404;
      return (error as OpenapiError).message;
    } else if (
      (error as OpenapiError).message ===
      "You have no permission to get this workspace"
    ) {
      res.status_code = 403;
      return (error as OpenapiError).message;
    } else {
      res.status_code = 500;
      throw error;
    }
  }

  // Get workspace projects
  let projects: Array<{
    id: number;
    display_name: string;
  }> = [];
  try {
    const projectSql = `SELECT id, display_name FROM wp_appq_project WHERE customer_id = ? ORDER BY id LIMIT ${limit} OFFSET ${start}`;
    projects = await db.query(db.format(projectSql, [workspaceId]));
    const countQuery = `SELECT COUNT(*) FROM wp_appq_project WHERE customer_id = ?`;
    total = await db.query(db.format(countQuery, [workspaceId]));
    total = await formatCount(total);
  } catch (error) {
    res.status_code = 500;
    throw error;
  }

  let returnProjects: Array<StoplightComponents["schemas"]["Project"]> = [];
  if (projects) {
    for (const project of projects) {
      // Check if user can see this project
      let hasPermission = false;
      const userToProjectSql =
        "SELECT * FROM wp_appq_user_to_project WHERE project_id = ?";
      let userToProjectRows: Array<{
        wp_user_id: number;
        project_id: number;
      }>;
      try {
        userToProjectRows = await db.query(
          db.format(userToProjectSql, [project.id])
        );
      } catch (error) {
        res.status_code = 500;
        throw error;
      }

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

      // Get campaigns count
      let campaigns;
      try {
        const campaignSql =
          "SELECT COUNT(*) AS count FROM wp_appq_evd_campaign WHERE project_id = ?";
        campaigns = await db.query(db.format(campaignSql, [project.id]));
      } catch (error) {
        res.status_code = 500;
        throw error;
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
};
