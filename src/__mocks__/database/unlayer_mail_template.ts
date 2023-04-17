import Table from "./tryber_table";

type UnlayerMailTemplateParams = {
  id?: number;
  name?: string;
  html_body?: string;
  json_body?: string;
};

const defaultItem: UnlayerMailTemplateParams = {
  name: "???",
  html_body: "???",
  json_body: "???",
};
class UnlayerTemplate extends Table<UnlayerMailTemplateParams> {
  protected name = "wp_appq_unlayer_mail_template";
  protected columns = [
    "id INTEGER PRIMARY KEY NOT NULL",
    "name VARCHAR(128)",
    "html_body LONGTEXT",
    "json_body LONGTEXT",
  ];

  constructor() {
    super(defaultItem);
  }
}
const template = new UnlayerTemplate();
export default template;
export type { UnlayerMailTemplateParams };
