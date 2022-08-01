/** OPENAPI-ROUTE: get-templates */
import { Context } from "openapi-backend";
import * as db from "@src/features/db";
import { TemplateParams } from "@src/__mocks__/database/templates";

export default async (c: Context, req: Request, res: OpenapiResponse) => {
  const templates = await db.query("SELECT * from wp_ug_templates", "unguess");

  res.status_code = 200;

  const items = templates.map((template: TemplateParams) => ({
    id: template.id,
    title: template.title,
    description: template.description,
    content: template.content,
    locale: template.locale,
    category: {
      id: template.category_id,
      name: "Category",
    },
    requiresLogin: !template.requires_login,
    device_type: template.device_type,
    ...(template.image && { image: template.image }),
  }));

  return items;
};
