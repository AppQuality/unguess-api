/** OPENAPI-ROUTE: get-workspace */
import { Context } from "openapi-backend";
import { getWorkspace } from "@src/utils/workspaces";
import { ERROR_MESSAGE } from "@src/utils/constants";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;
  let error = {
    message: ERROR_MESSAGE,
    code: 0,
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  res.status_code = 200;

  try {
    let wid = parseInt(c.request.params.wid as string);

    const result = await getWorkspace({
      workspaceId: wid,
      user: user,
    });

    return result as StoplightComponents["schemas"]["Workspace"];
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
