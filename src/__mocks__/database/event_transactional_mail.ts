import Table from "./tryber_table";

type UnlayerMailTemplateParams = {
  id?: number;
  event_name?: string;
  event_description?: string;
  template_id?: number;
};

const defaultItem: UnlayerMailTemplateParams = {
  event_name: "???",
  event_description: "0",
};
class UnlayerTemplate extends Table<UnlayerMailTemplateParams> {
  protected name = "wp_appq_event_transactional_mail";
  protected columns = [
    "id INTEGER PRIMARY KEY NOT NULL",
    "event_name VARCHAR(128) NOT NULL",
    "event_description VARCHAR(128) NOT NULL",
    "template_id INTEGER NOT NULL",
  ];

  constructor() {
    super(defaultItem);
  }
}
const template = new UnlayerTemplate();
export default template;
export type { UnlayerMailTemplateParams };
