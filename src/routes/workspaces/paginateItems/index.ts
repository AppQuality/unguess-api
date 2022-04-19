import { ERROR_MESSAGE } from "@src/routes/shared";

const getEmptyPage = () => {
  return {
    items: [],
    start: 0,
    limit: 0,
    size: 0,
    total: 0,
  };
};

type Pagination = {
  items: any[];
  limit?: any;
  start?: any;
  total?: any;
};

export default async (data: Pagination) => {
  let error = { message: ERROR_MESSAGE, code: 400 };
  let { items, limit, start, total } = data;

  if (total < 0) return error;

  return items.length
    ? {
        items,
        start,
        limit,
        size: items.length,
        total,
      }
    : getEmptyPage();
};

export const formatPaginationParams = async (limit: any, start: any) => {
  let error = { message: ERROR_MESSAGE, code: 400 };
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
