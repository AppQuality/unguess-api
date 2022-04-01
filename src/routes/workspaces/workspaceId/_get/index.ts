/** OPENAPI-ROUTE: get-workspace */
import { Context } from "openapi-backend";
import getWorkspace from "../getWorkspace";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let workspace;
  res.status_code = 200;
  try {
    let wid;
    if (typeof c.request.params.wid == "string")
      wid = parseInt(
        c.request.params.wid
      ) as StoplightOperations["get-workspace"]["parameters"]["path"]["wid"];

    if (!wid) {
      res.status_code = 400;
      return "Bad request";
    }

    workspace = await getWorkspace(wid);
  } catch (e) {
    if ((e as OpenapiError).message === "No workspace found") {
      res.status_code = 404;
      return (e as OpenapiError).message;
    } else {
      res.status_code = 500;
      throw e;
    }
  }

  return workspace as StoplightComponents["schemas"]["Workspace"];
};
