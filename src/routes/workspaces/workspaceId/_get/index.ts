/** OPENAPI-ROUTE: get-workspace */
import { Context } from "openapi-backend";
import getWorkspace from "../getWorkspace";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;
  let { wid } = c.request.params;

  let workspace = getWorkspace(parseInt(wid as string));
  res.status_code = 200;
  return workspace;
};
