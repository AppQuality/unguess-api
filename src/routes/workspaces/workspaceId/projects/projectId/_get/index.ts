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

  let wid = parseInt(c.request.params.wid as string);
  let pid = parseInt(c.request.params.pid as string);

  try {
    await getWorkspace(wid, user);

    let projectResult = await getProject(pid, wid);
    return projectResult;
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
