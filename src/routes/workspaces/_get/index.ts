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
    message: ERROR_MESSAGE,
  } as StoplightComponents["schemas"]["Error"];

  try {
    let limit = c.request.query.limit || 10;
    let start = c.request.query.start || 0;

    const paginationResult = await formatPaginationParams(limit, start);
    if ("code" in paginationResult) {
      res.status_code = paginationResult.code;
      return paginationResult;
    } else {
      limit = paginationResult.formattedLimit;
      start = paginationResult.formattedStart;
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
