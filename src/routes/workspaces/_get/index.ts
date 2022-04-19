/** OPENAPI-ROUTE: get-workspaces */
import { Context } from "openapi-backend";
import getUserWorkspaces from "../getUserWorkspaces";
import paginateItems, {
  formatPaginationParams,
} from "@src/routes/workspaces/paginateItems";
import { ERROR_MESSAGE } from "@src/routes/shared";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let error = {
    error: true,
    message: ERROR_MESSAGE,
  } as StoplightComponents["schemas"]["Error"];

  try {
    let limit = (c.request.query.limit as string) || 10;
    let start = (c.request.query.start as string) || 0;

    if (typeof limit === "string") {
      limit = parseInt(limit) as StoplightComponents["parameters"]["limit"];
    }

    if (typeof start === "string") {
      start = parseInt(start) as StoplightComponents["parameters"]["start"];
    }

    let userWorkspaces = await getUserWorkspaces(req.user, limit, start);

    if (userWorkspaces.workspaces.length) {
      res.status_code = 200;
      return await paginateItems({
        items: userWorkspaces.workspaces,
        limit,
        start,
        total: userWorkspaces.total,
      });
    }

    return await paginateItems({ items: [] });
  } catch (e) {
    res.status_code = 500;
    error.code = 500;
    return error;
  }
};
