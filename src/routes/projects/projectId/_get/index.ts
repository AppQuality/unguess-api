/** OPENAPI-ROUTE: get-projects-projectId */
import { Context } from "openapi-backend";
import getProjectById from "@src/utils/getProjectById";
import { ERROR_MESSAGE } from "@src/utils/consts";

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

  let pid = parseInt(c.request.params.pid as string);

  try {
    return await getProjectById(pid, user);
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
