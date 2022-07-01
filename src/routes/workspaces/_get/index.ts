/** OPENAPI-ROUTE: get-workspaces */
import { Context } from "openapi-backend";
import { getUserWorkspaces } from "@src/utils/workspaces";
import { paginateItems } from "@src/utils/paginations";
import {
  ERROR_MESSAGE,
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
} from "@src/utils/constants";
import {
  WorkspaceOrderBy,
  WorkspaceOrders,
} from "@src/utils/workspaces/getUserWorkspaces";

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
    const limit = c.request.query.limit
      ? parseInt(c.request.query.limit as string)
      : (LIMIT_QUERY_PARAM_DEFAULT as StoplightComponents["parameters"]["limit"]);
    const start = c.request.query.start
      ? parseInt(c.request.query.start as string)
      : (START_QUERY_PARAM_DEFAULT as StoplightComponents["parameters"]["start"]);

    const order =
      c.request.query.order &&
      ["ASC", "DESC"].includes((c.request.query.order as string).toUpperCase())
        ? ((c.request.query.order as string).toUpperCase() as WorkspaceOrders)
        : "ASC";

    const orderBy =
      c.request.query.orderBy &&
      ["id", "company", "tokens"].includes(
        (c.request.query.orderBy as string).toLowerCase()
      )
        ? ((
            c.request.query.orderBy as string
          ).toLowerCase() as WorkspaceOrderBy)
        : "id";

    let userWorkspaces = await getUserWorkspaces(req.user, {
      limit,
      start,
      ...(order && { order: order }),
      ...(orderBy && { orderBy: orderBy }),
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
