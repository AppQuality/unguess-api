/** OPENAPI-ROUTE: post-projects */
import { Context } from "openapi-backend";
import { ERROR_MESSAGE } from "@src/utils/consts";
import { getWorkspace } from "@src/utils/getWorkspace";
import { createProject } from "@src/utils/createProject";

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

    // Create the project
    let project = await createProject(request_body, user);

    return project as StoplightComponents["schemas"]["Project"];
  } catch (e: any) {
    console.error(e);

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
