/** OPENAPI-CLASS: get-templates */

import UserRoute from "@src/features/routes/UserRoute";
import * as db from "@src/features/db";
import { TemplateParams } from "@src/__mocks__/database/templates";
import { ERROR_MESSAGE } from "@src/utils/constants";
import { Context } from "openapi-backend";

const orderableColumns = ["id", "title", "category_id", "locale"];
const filterableColumns = [
  "category_id",
  "locale",
  "requires_login",
  "device_type",
];

interface GetTemplatesArgs {
  filterBy?: { [key: string]: string | string[] };
  orderBy?: string;
  order?: string;
}

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

interface TemplateObject extends TemplateParams {
  categoryName?: string;
}

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

export default class Route extends UserRoute<{
  response: StoplightOperations["get-templates"]["responses"]["200"]["content"]["application/json"];
  query: StoplightOperations["get-templates"]["parameters"]["query"];
}> {
  private request: OpenapiRequest;
  private response: OpenapiResponse;
  private context: Context;
  private order: string | string[];

  constructor(config: RouteClassConfiguration) {
    super(config);
    this.request = this.configuration.request;
    this.response = this.configuration.response;
    this.context = this.configuration.context;
    this.order = this.context.request.query.order;
  }

  protected async prepare() {
    let error = {
      error: true,
      message: ERROR_MESSAGE,
    } as StoplightComponents["schemas"]["Error"];

    try {
      const order =
        this.order &&
        ["ASC", "DESC"].includes((this.order as string).toUpperCase())
          ? (this.context.request.query.order as string).toUpperCase()
          : "ASC";

      const orderBy =
        this.context.request.query.orderBy &&
        orderableColumns.includes(
          (this.context.request.query.orderBy as string).toLowerCase()
        )
          ? (this.context.request.query.orderBy as string).toLowerCase()
          : "id";

      let templates = await getTemplates({
        ...(this.request.query.filterBy !== undefined && {
          filterBy: this.request.query.filterBy as {
            [key: string]: string | string[];
          },
        }),
        ...(order && { order: order }),
        ...(orderBy && { orderBy: orderBy }),
      });

      if (templates.length) {
        return this.setSuccess(200, prepareItems(templates) as any);
      }

      this.setSuccess(200, []);
    } catch (e: any) {
      if (e.code) {
        this.setError(e.code, {} as OpenapiError);
      } else {
        this.setError(500, {} as OpenapiError);
      }
    }
  }
}
