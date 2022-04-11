/** OPENAPI-ROUTE: get-workspaces */
import { Context } from "openapi-backend";
import getUserWorkspaces from "../getUserWorkspaces";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  try {
    let workspaces = await getUserWorkspaces(req.user);

    if (workspaces.length) {
      res.status_code = 200;
      return workspaces;
    }

    res.status_code = 404;
    return [];
  } catch (error) {
    console.error(error);
    res.status_code = 500;
  }
};
