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
  total: number;
};

export default async (data: PaginationParams) => {
  let { items, limit, start, total } = data;

  if (typeof total === "string") {
    total = parseInt(total);
  }

  return items.length
    ? {
        items,
        start,
        limit,
        size: items.length,
        total,
      }
    : emptyPaginatedResponse();
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
