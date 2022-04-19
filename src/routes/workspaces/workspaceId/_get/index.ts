/** OPENAPI-ROUTE: get-workspace */
import { Context } from "openapi-backend";
import getWorkspace from "../getWorkspace";
import { ERROR_MESSAGE } from "@src/routes/shared";

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
    let wid;
    if (typeof c.request.params.wid == "string")
      wid = parseInt(
        c.request.params.wid
      ) as StoplightOperations["get-workspace"]["parameters"]["path"]["wid"];

    if (!wid) {
      res.status_code = 400;
      error.code = 400;
      return error;
    }

    const result = await getWorkspace(wid, user);

    if ("code" in result) {
      res.status_code = result.code || 500;
      error.code = result.code;
      return error;
    }
    return result as StoplightComponents["schemas"]["Workspace"];
  } catch (e) {
    error.code = 500;
    return error;
  }
};
