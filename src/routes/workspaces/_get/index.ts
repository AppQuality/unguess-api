/** OPENAPI-ROUTE: get-workspaces */
import { Context } from "openapi-backend";
import * as db from "../../../features/db";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;

  res.status_code = 200;

  try {
    return [
      {
        id: 1,
        company: "",
        logo: "",
        tokens: 1,
      },
    ];
  } catch (error) {
    console.error(error);
  }
};
