/** OPENAPI-ROUTE: get-workspace-project */
import { Context } from "openapi-backend";
import * as db from "../../../../../../features/db";
import getProject from "../getProject";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  res.status_code = 200;

  let workspaceId;
  if (typeof c.request.params.wid == "string") {
    workspaceId = parseInt(
      c.request.params.wid
    ) as StoplightOperations["get-workspace-project-campaigns"]["parameters"]["path"]["wid"];
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

  let projectId;
  if (typeof c.request.params.pid == "string") {
    projectId = parseInt(
      c.request.params.pid
    ) as StoplightOperations["get-workspace-project-campaigns"]["parameters"]["path"]["pid"];
  }

  // Check if projectId is valid
  if (typeof projectId == "undefined" || projectId == null || projectId < 0) {
    res.status_code = 400;
    return "Project id is not valid";
  }

  try {
    let returnProject: StoplightComponents["schemas"]["Project"] =
      await getProject(projectId);

    return returnProject;
  } catch (error) {
    if ((error as OpenapiError).message == "No project found") {
      res.status_code = 404;
      return (error as OpenapiError).message;
    } else {
      res.status_code = 500;
      throw error;
    }
  }
};
