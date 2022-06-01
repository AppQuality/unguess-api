/** OPENAPI-ROUTE: get-workspace-project */
import { Context } from "openapi-backend";
import { getProject } from "@src/utils/getProject";
import { getWorkspace } from "@src/utils/getWorkspace";
import { ERROR_MESSAGE } from "@src/utils/consts";
import { getUserProjects } from "@src/utils/getUserProjects";

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
  let pid = parseInt(c.request.params.pid as string);

  try {
    // Get customer
    await getWorkspace(wid, user);

    // Get all customer's project
    let customerProjects = await getUserProjects(wid, user);

    // Get all project ids
    let projectIds = customerProjects.map((project) => project.id);

    // Get requested project
    let project = await getProject(pid, wid);

    if (projectIds.includes(project.id)) {
      return project;
    }

    return { ...error, code: 403 };
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
