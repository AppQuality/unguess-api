/** OPENAPI-ROUTE: get-workspace */
import { Context } from "openapi-backend";
import getWorkspace from "../getWorkspace";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;

  res.status_code = 200;

  try {
    let wid;
    if (typeof c.request.params.wid == "string")
      wid = parseInt(
        c.request.params.wid
      ) as StoplightOperations["get-workspace"]["parameters"]["path"]["wid"];

    if (!wid) {
      res.status_code = 400;
      throw Error("Bad request");
    }

    return (await getWorkspace(
      wid,
      user
    )) as StoplightComponents["schemas"]["Workspace"];
  } catch (e) {
    if ((e as OpenapiError).message === "No workspace found") {
      res.status_code = 404;
      return (e as OpenapiError).message;
    } else if ((e as OpenapiError).message === "Bad request") {
      res.status_code = 400;
      return (e as OpenapiError).message;
    } else if (
      (e as OpenapiError).message ===
      "You have no permission to get this workspace"
    ) {
      res.status_code = 403;
      return (e as OpenapiError).message;
    } else {
      res.status_code = 500;
      throw e;
    }
  }
};
