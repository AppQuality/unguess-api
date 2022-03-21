/** OPENAPI-ROUTE: get-workspace-projects */
import { Context } from "openapi-backend";
import * as db from "../../../../../features/db";
import getWorkspace from "../../getWorkspace/";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;

  res.status_code = 200;

  return [
    {
      id: 1,
      name: "Projettino unoh",
      customer_id: 1,
    },
    {
      id: 2,
      name: "Projettino dueh",
      customer_id: 1,
    },
  ];
};
