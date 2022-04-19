import { ERROR_MESSAGE } from "@src/routes/shared";

type PaginationParams = {
  items:
    | Array<
        | StoplightComponents["schemas"]["Campaign"]
        | StoplightComponents["schemas"]["Project"]
        | StoplightComponents["schemas"]["Workspace"]
      >
    | [];
  limit?: StoplightComponents["parameters"]["limit"];
  start?: StoplightComponents["parameters"]["start"];
};

export default async (data: PaginationParams) => {
  let { items, limit, start } = data;

  // Check if params are valid
  if (limit && start) {
    let result = await formatPaginationParams(limit, start);
    if ("error" in result) {
      let error = result as StoplightComponents["schemas"]["Error"];
      return error;
    }
  }

  return items.length
    ? {
        items,
        start,
        limit,
        total: items.length,
        size,
      }
    : emptyPaginatedResponse();
};

export const formatPaginationParams = async (limit: number, start: number) => {
  let error = { message: ERROR_MESSAGE, code: 400, error: true };
  if (typeof limit === "string") {
    limit = parseInt(limit) as StoplightComponents["parameters"]["limit"];
  }

  if (typeof start === "string") {
    start = parseInt(start) as StoplightComponents["parameters"]["start"];
  }

  if (start < 0 || limit < 0) {
    return error;
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
