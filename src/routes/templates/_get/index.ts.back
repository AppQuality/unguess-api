/** OPENAPI-ROUTE: get-templates */
import { Context } from "openapi-backend";
import * as db from "@src/features/db";
import { TemplateParams } from "@src/__mocks__/database/templates";
import { ERROR_MESSAGE } from "@src/utils/constants";

interface GetTemplatesArgs {
  filterBy?: { [key: string]: string | string[] };
  orderBy?: string;
  order?: string;
}

interface TemplateObject extends TemplateParams {
  categoryName?: string;
}

const orderableColumns = ["id", "title", "category_id", "locale"];
const filterableColumns = [
  "category_id",
  "locale",
  "requires_login",
  "device_type",
];

const getTemplates = async ({
  filterBy,
  orderBy,
  order,
}: GetTemplatesArgs): Promise<StoplightComponents["schemas"]["Template"][]> => {
  const queryData: string[] = [];

  let query =
    "SELECT t.*, c.name as categoryName FROM wp_ug_templates as t LEFT JOIN wp_ug_template_categories as c ON (t.category_id = c.id)";

  if (filterBy) {
    let acceptedFilters = filterableColumns.filter((f) =>
      Object.keys(filterBy).includes(f)
    );

    //check filter
    if (acceptedFilters.length) {
      acceptedFilters = acceptedFilters.map((k) => {
        const v = filterBy[k];
        if (typeof v === "string") {
          queryData.push(v);
          return `t.${k}=?`;
        } else if (Number.isInteger(v)) {
          queryData.push(v.toString());
          return `t.${k}=?`;
        }
        return "";
      });
      query += " WHERE " + Object.values(acceptedFilters).join(" AND ");
    }
  }

  if (order && orderBy) {
    if (orderableColumns.includes(orderBy)) {
      query += ` ORDER BY t.${orderBy} ${order}`;
    }
  }

  if (queryData.length) {
    query = db.format(query, queryData);
  }

  let templates = await db.query(query, "unguess");

  return templates.length ? templates : [];
};

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
    res.status_code = 200;
    const order =
      c.request.query.order &&
      ["ASC", "DESC"].includes((c.request.query.order as string).toUpperCase())
        ? (c.request.query.order as string).toUpperCase()
        : "ASC";

    const orderBy =
      c.request.query.orderBy &&
      orderableColumns.includes(
        (c.request.query.orderBy as string).toLowerCase()
      )
        ? (c.request.query.orderBy as string).toLowerCase()
        : "id";

    let templates = await getTemplates({
      ...(req.query.filterBy !== undefined && {
        filterBy: req.query.filterBy as { [key: string]: string | string[] },
      }),
      ...(order && { order: order }),
      ...(orderBy && { orderBy: orderBy }),
    });

    if (templates.length) {
      return prepareItems(templates);
    }

    return [];
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

const prepareItems = (items: TemplateObject[]) => {
  return items.map((item: TemplateObject) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    category: { id: -1, name: "Uncategorized" },
    ...(item.categoryName && {
      category: {
        id: item.category_id,
        name: item.categoryName,
      },
    }),
    locale: item.locale,
    requiresLogin: !!item.requires_login,
    device_type: item.device_type,
    ...(item.image && { image: item.image }),
  }));
};
