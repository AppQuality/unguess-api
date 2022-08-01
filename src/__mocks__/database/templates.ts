import Table from "./table";

type TemplateParams = {
  id?: number;
  title?: string;
  description?: string;
  content?: string;
  group_id?: number;
  device_type?: "webapp" | "mobileapp";
  image?: string;
  locale?: string;
  requires_login?: boolean;
};

const defaultItem: TemplateParams = {
  id: 1,
  title: "???",
  description: "???",
  content: "???",
  group_id: 0,
  device_type: "webapp",
  locale: "en",
};
class Templates extends Table<TemplateParams> {
  protected name = "templates";
  protected columns = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "title VARCHAR(255)",
    "description VARCHAR(255)",
    "content TEXT",
    "group_id INTEGER",
    "device_type VARCHAR(64)",
    "image VARCHAR(255)",
    "locale VARCHAR(64)",
    "requires_login BOOLEAN",
  ];
  constructor() {
    super(defaultItem);
  }
}
const templates = new Templates();
export default templates;
export type { TemplateParams };
