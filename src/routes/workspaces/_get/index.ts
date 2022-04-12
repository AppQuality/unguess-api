/** OPENAPI-ROUTE: get-workspaces */
import { Context } from "openapi-backend";
import getUserWorkspaces from "../getUserWorkspaces";
import paginateItems, { formatPagination } from "@src/paginateItems";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  try {
    let limit = c.request.query.limit || 10;
    let start = c.request.query.start || 0;

    const { formattedLimit, formattedStart } = await formatPagination(
      limit,
      start
    );
    limit = formattedLimit;
    start = formattedStart;

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

    res.status_code = 404;
    return await paginateItems({ items: [] });
  } catch (error) {
    if (
      (error as OpenapiError).message ===
      "Bad request, pagination data is not valid"
    )
      res.status_code = 400;
    else res.status_code = 500;
    console.error(error);
  }
};
