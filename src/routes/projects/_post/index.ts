/** OPENAPI-ROUTE: post-projects */
import { Context } from "openapi-backend";
import { ERROR_MESSAGE } from "@src/routes/shared";
import getWorkspace from "@src/routes/workspaces/workspaceId/getWorkspace";
import getUserWorkspaces from "@src/routes/workspaces/getUserWorkspaces";
import createProject from "../createProject";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;
  let error = {
    code: 500,
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];
  let request_body: StoplightComponents["requestBodies"]["Project"]["content"]["application/json"] =
    req.body;

  res.status_code = 200;

  try {
    // Check if workspace exists
    await getWorkspace(request_body.customer_id, user);

    // Check if user can see the workspace
    await getUserWorkspaces(user, request_body.customer_id);

    // Create the project
    let project = await createProject(request_body);

    return project as StoplightComponents["schemas"]["Project"];
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
