const getEmptyPage = () => {
  return {
    items: [],
    total: 0,
    limit: 0,
    start: 0,
    size: 0,
  };
};

type Pagination = {
  items: any[];
  limit?: any;
  start?: any;
  total?: any;
};

export default async (data: Pagination) => {
  let { items, limit, start, total } = data;

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
  if (typeof limit === "string") {
    limit = parseInt(limit) as StoplightComponents["parameters"]["limit"];
  }

  if (typeof start === "string") {
    start = parseInt(start) as StoplightComponents["parameters"]["start"];
  }

  if (start < 0 || limit < 0) {
    throw Error("Bad request, pagination data is not valid");
  }
  return { formattedLimit: limit, formattedStart: start };
};

export const formatCount = (count: any[]) => {
  return count.map((el: any) => el["COUNT(*)"])[0];
};
