import Table from "./table";

type TemplateCategoryParams = {
  id?: number;
  name?: string;
};

const defaultItem: TemplateCategoryParams = {
  id: 1,
  name: "???",
};
class TemplateCategories extends Table<TemplateCategoryParams> {
  protected name = "wp_ug_template_categories";
  protected columns = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "name VARCHAR(255)",
  ];
  constructor() {
    super(defaultItem);
  }
}
const templateCategories = new TemplateCategories();
export default templateCategories;
export type { TemplateCategoryParams };
