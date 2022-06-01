/** OPENAPI-ROUTE: get-workspaces */
import { Context } from "openapi-backend";
import getUserWorkspaces from "@src/utils/getUserWorkspaces";
import { paginateItems } from "@src/utils/paginateItems";
import {
  ERROR_MESSAGE,
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
} from "@src/utils/consts";

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
    let limit = c.request.query.limit
      ? parseInt(c.request.query.limit as string)
      : (LIMIT_QUERY_PARAM_DEFAULT as StoplightComponents["parameters"]["limit"]);
    let start = c.request.query.start
      ? parseInt(c.request.query.start as string)
      : (START_QUERY_PARAM_DEFAULT as StoplightComponents["parameters"]["start"]);

    let userWorkspaces = await getUserWorkspaces(req.user, {
      limit,
      start,
    });

    if (userWorkspaces.workspaces.length) {
      res.status_code = 200;
      return await paginateItems({
        items: userWorkspaces.workspaces,
        limit,
        start,
        total: userWorkspaces.total,
      });
    }

    return await paginateItems({ items: [], total: 0 });
  } catch (e: any) {
    if (e.code) {
      error.code = e.code;
      res.status_code = e.code;
    } else {
      error.code = 500;
      res.status_code = 500;
    }

    return error;
  }
};
