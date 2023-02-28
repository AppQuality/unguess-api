/** OPENAPI-CLASS: get-templates */
import UserRoute from "@src/features/routes/UserRoute";
import * as db from "@src/features/db";

type templateFromDb = {
  id: number;
  title: string;
  description: string;
  content: string;
  category_id: number;
  categoryName: string | null;
  locale?: "en" | "it";
  requires_login: boolean;
  device_type?: "webapp" | "mobileapp";
  image?: string;
};

export default class Route extends UserRoute<{
  response: StoplightOperations["get-templates"]["responses"]["200"]["content"]["application/json"];
  query: StoplightOperations["get-templates"]["parameters"]["query"];
}> {
  private order: StoplightOperations["get-templates"]["parameters"]["query"]["order"];
  private orderBy: StoplightOperations["get-templates"]["parameters"]["query"]["orderBy"];
  private filterBy: PartialRecord<(typeof this.FILTER_KEYS)[number], string>;
  private ORDERABLE_COLUMNS = [
    "id" as const,
    "title" as const,
    "category_id" as const,
    "locale" as const,
  ];
  private FILTER_KEYS = [
    "category_id" as const,
    "locale" as const,
    "requires_login" as const,
    "device_type" as const,
  ];

  constructor(config: RouteClassConfiguration) {
    super(config);
    this.order = this.getQuery().order;

    this.orderBy = this.getOrderBy();
    this.filterBy = this.getFilterBy();
  }

  private getOrderBy() {
    const orderBy = this.getQuery().orderBy;
    if (orderBy && this.ORDERABLE_COLUMNS.includes(orderBy as any)) {
      return orderBy;
    }
  }

  private getFilterBy() {
    let result: PartialRecord<(typeof this.FILTER_KEYS)[number], string> = {};
    if (!this.getQuery().filterBy) {
      return result;
    }
    const filters = this.getQuery().filterBy as {
      [key: string]: string;
    };
    for (const validKey of this.FILTER_KEYS) {
      if (Object.keys(filters).includes(validKey)) {
        result[validKey as (typeof this.FILTER_KEYS)[number]] =
          filters[validKey];
      }
    }
    return result;
  }

  protected async prepare() {
    const templates = await this.getTemplates();
    return this.setSuccess(
      200,
      templates.map((item) => ({
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
      }))
    );
  }

  private async getTemplates() {
    const templates: templateFromDb[] = await db.query(
      ` 
    SELECT t.id, t.title, t.description, t.content, t.category_id, c.name as categoryName,
    t.locale, t.requires_login, t.device_type, t.image 
    FROM wp_ug_templates as t 
    LEFT JOIN wp_ug_template_categories as c 
    ON (t.category_id = c.id)
    ${this.getWhereClause()}
    ${this.getOrderClause()}
    `,
      "unguess"
    );
    return templates;
  }

  private getOrderClause() {
    if (!this.order) return "";
    if (!this.orderBy) return "";

    return ` ORDER BY t.${this.orderBy} ${this.order}`;
  }

  private getWhereClause() {
    if (!this.filterBy || !Object.keys(this.filterBy).length) return "";
    const andClauses = Object.keys(this.filterBy)
      .map((k) => {
        const v = this.filterBy[k as keyof Route["filterBy"]];
        if (!v) return "";
        if (Number.isInteger(v)) {
          return db.format(`t.${k}=?`, [v.toString()]);
        }
        if (typeof v === "string") {
          return db.format(`t.${k}=?`, [v]);
        }
        return "";
      })
      .join(" AND ");
    return " WHERE " + andClauses;
  }
}
