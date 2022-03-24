/** OPENAPI-ROUTE: get-workspace-project */
import { Context } from "openapi-backend";
import * as db from "../../../../../../features/db";
import getProject from "../getProject";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;

  res.status_code = 200;

  return {
    id: 1,
    name: "Projettino unoh",
  };
};
