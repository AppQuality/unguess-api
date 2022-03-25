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
      campaigns_count: 5,
    },
    {
      id: 2,
      name: "Projettino dueh",
      campaigns_count: 10,
    },
  ];
};
