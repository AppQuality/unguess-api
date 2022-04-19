/** OPENAPI-ROUTE: get-workspace-project */
import { Context } from "openapi-backend";
import getProject from "../getProject";
import getWorkspace from "../../../getWorkspace";
import { ERROR_MESSAGE } from "@src/routes/shared";

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
    error.code = 400;
    return error;
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
    error.code = 400;
    return error;
  }

  let workspaceResult = await getWorkspace(workspaceId, user);

  if ("code" in workspaceResult) {
    res.status_code = workspaceResult.code || 500;
    error.code = workspaceResult.code || 500;
    return error;
  }

  let projectResult = await getProject(projectId, workspaceId);
  if ("code" in projectResult) {
    res.status_code = projectResult.code || 500;
    error.code = projectResult.code || 500;
    return error;
  }
  return projectResult;
};
