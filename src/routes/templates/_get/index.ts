/** OPENAPI-CLASS: get-templates */
import UserRoute from "@src/features/routes/UserRoute";
import { unguess } from "@src/features/database";

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
    if (!this.getQuery().filterBy) return {};
    const filters = this.getQuery().filterBy as {
      [key: string]: string;
    };

    const result: PartialRecord<(typeof this.FILTER_KEYS)[number], string> = {};
    this.FILTER_KEYS.forEach((key) => {
      if (Object.keys(filters).includes(key)) result[key] = filters[key];
    });

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
        category: item.categoryName
          ? {
              id: item.category_id,
              name: item.categoryName,
            }
          : { id: -1, name: "Uncategorized" },
        locale: ["en", "it"].includes(item.locale)
          ? (item.locale as "en" | "it")
          : undefined,
        requiresLogin: !!item.requires_login,
        device_type: ["webapp", "mobileapp"].includes(item.device_type)
          ? (item.device_type as "webapp" | "mobileapp")
          : undefined,
        ...(item.image && { image: item.image }),
      }))
    );
  }

  private async getTemplates() {
    const query = unguess.tables.WpUgTemplates.do()
      .select(
        unguess.ref("id").withSchema("wp_ug_templates").as("id"),
        "title",
        "description",
        "content",
        "category_id",
        "locale",
        "requires_login",
        "device_type",
        "image",
        unguess
          .ref("name")
          .withSchema("wp_ug_template_categories")
          .as("categoryName")
      )
      .leftJoin(
        "wp_ug_template_categories",
        "wp_ug_templates.category_id",
        "wp_ug_template_categories.id"
      );

    if (this.orderBy && this.order) {
      query.orderBy(this.orderBy, this.order);
    }

    if (this.filterBy) {
      query.where(this.filterBy);
    }

    return await query;
  }
}
