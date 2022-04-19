import { ERROR_MESSAGE } from "@src/routes/shared";

type PaginationParams = {
  items:
    | Array<
        | StoplightComponents["schemas"]["Campaign"]
        | StoplightComponents["schemas"]["Project"]
        | StoplightComponents["schemas"]["Workspace"]
      >
    | [];
  limit?: StoplightComponents["parameters"]["limit"] | string;
  start?: StoplightComponents["parameters"]["start"] | string;
  total?: number | null;
};

export default async (data: PaginationParams) => {
  let { items, limit, start, total } = data;

  // Check if params are valid
  let formattedParamsResult = await formatPaginationParams(limit, start, total);
  if ("error" in formattedParamsResult) {
    let error =
      formattedParamsResult as StoplightComponents["schemas"]["Error"];
    return error;
  }

  return items.length
    ? {
        items,
        start: formattedParamsResult.formattedStart,
        limit: formattedParamsResult.formattedLimit,
        size: items.length,
        total,
      }
    : emptyPaginatedResponse();
};

export const formatPaginationParams = async (
  limit: PaginationParams["limit"],
  start: PaginationParams["start"],
  total: PaginationParams["total"]
) => {
  let error = { message: ERROR_MESSAGE, code: 400, error: true };

  if (total !== undefined) {
    if (total !== null) {
      if (total < 0) {
        return error;
      }
    } else {
      return error;
    }
  }

  if (typeof total === "string") {
    total = parseInt(total);
  }

  if (typeof limit === "string") {
    limit = parseInt(limit) as StoplightComponents["parameters"]["limit"];
    if (!Number.isInteger(limit)) {
      return error;
    }
  }

  if (typeof start === "string") {
    start = parseInt(start) as StoplightComponents["parameters"]["start"];
    if (!Number.isInteger(start)) {
      return error;
    }
  }

  if (limit !== undefined && start !== undefined) {
    if (start < 0 || limit < 0) {
      return error;
    }
  }

  return { formattedLimit: limit, formattedStart: start };
};

export const formatCount = (count: any[]): number => {
  return parseInt(count.map((el: any) => el["COUNT(*)"])[0]);
};

const emptyPaginatedResponse = () => {
  return {
    items: [],
    start: 0,
    limit: 0,
    size: 0,
    total: 0,
  };
};
