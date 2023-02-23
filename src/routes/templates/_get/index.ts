/** OPENAPI-CLASS: get-templates */
import UserRoute from "@src/features/routes/UserRoute";
import * as db from "@src/features/db";
import { TemplateParams } from "@src/__mocks__/database/templates";

interface TemplateObject extends TemplateParams {
  categoryName?: string;
}
type filterBy = { [key: string]: string | string[] };
type templateFromDb = {
  id: number;
  title: string;
  description: string;
  content: string;
  category_id: number;
  categoryName: string | null;
  locale: "en" | "it" | undefined;
  requires_login: boolean;
  device_type: "webapp" | "mobileapp" | undefined;
  image?: string;
};

export default class Route extends UserRoute<{
  response: StoplightOperations["get-templates"]["responses"]["200"]["content"]["application/json"];
  query: StoplightOperations["get-templates"]["parameters"]["query"];
}> {
  private order: StoplightOperations["get-templates"]["parameters"]["query"]["order"];
  private orderBy: StoplightOperations["get-templates"]["parameters"]["query"]["orderBy"];
  private filterBy: filterBy;
  private orderableColumns: string[];
  private filterableColumns: string[];

  constructor(config: RouteClassConfiguration) {
    super(config);
    this.order = this.getQuery().order;
    this.orderBy = this.getQuery().orderBy;
    this.filterBy =
      typeof this.getQuery().filterBy === undefined
        ? {}
        : (this.getQuery().filterBy as filterBy);

    this.orderableColumns = ["id", "title", "category_id", "locale"];
    this.filterableColumns = [
      "category_id",
      "locale",
      "requires_login",
      "device_type",
    ];
  }

  protected async prepare() {
    return this.setSuccess(200, await this.getMappedTemplatesFromDB());
  }

  private async getMappedTemplatesFromDB() {
    const templates = await this.getTemplatesFromDb();
    return this.mapItems(templates);
  }

  private async getTemplatesFromDb() {
    const queryData: string[] = [];
    let query = ` 
      SELECT t.id, t.title, t.description, t.content, t.category_id, c.name as categoryName,
        t.locale, t.requires_login, t.device_type, t.image 
      FROM wp_ug_templates as t 
        LEFT JOIN wp_ug_template_categories as c 
          ON (t.category_id = c.id)`;
    if (this.filterBy) {
      let acceptedFilters = this.filterableColumns.filter((f) =>
        Object.keys(this.filterBy).includes(f)
      );
      //check filter
      if (acceptedFilters.length) {
        acceptedFilters = this.updateFilters(acceptedFilters, queryData);
        query += " WHERE " + Object.values(acceptedFilters).join(" AND ");
      }
    }
    if (this.order && this.orderBy) {
      if (this.orderableColumns.includes(this.orderBy)) {
        query += ` ORDER BY t.${this.orderBy} ${this.order}`;
      }
    }
    if (queryData.length) {
      query = db.format(query, queryData);
    }

    let templates: templateFromDb[] = await db.query(query, "unguess");
    if (!templates.length) return [];
    return templates;
  }

  private updateFilters(acceptedFilters: string[], queryData: string[]) {
    acceptedFilters = acceptedFilters.map((k) => {
      const v = this.filterBy[k];
      if (Number.isInteger(v)) {
        queryData.push(v.toString());
        return `t.${k}=?`;
      }
      if (typeof v === "string") {
        queryData.push(v);
        return `t.${k}=?`;
      }
      return "";
    });
    return acceptedFilters;
  }

  private mapItems(items: Awaited<ReturnType<Route["getTemplatesFromDb"]>>) {
    return items.map((item) => ({
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
  }
}
