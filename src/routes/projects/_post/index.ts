/** OPENAPI-ROUTE: post-projects */
import { Context } from "openapi-backend";
import { ERROR_MESSAGE } from "@src/utils/constants";
import { getWorkspace } from "@src/utils/workspaces";
import { createProject } from "@src/utils/projects";

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
    await getWorkspace({
      workspaceId: request_body.customer_id,
      user: user,
    });

    // Create the project
    let project = await createProject(request_body, user);

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
