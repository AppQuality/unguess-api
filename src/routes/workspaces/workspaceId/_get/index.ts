/** OPENAPI-ROUTE: get-workspace */
import { Context } from "openapi-backend";
import * as db from "../../../../features/db";
import getWorkspace from "../getWorkspace";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;

  res.status_code = 200;

  return {
    id: 1,
    company: "Company",
    logo: "logo.png",
    tokens: 100,
  };
};
