import Table from "./tryber_table";

type TemplateParams = {
  id?: number;
  title?: string;
  content?: string;
  campaign_id?: number;
  is_required?: number;
  jf_code?: string;
  jf_text?: string;
  group_id?: number;
  position?: number;
  allow_media?: number;
  optimize_media?: number;
};

const defaultItem: TemplateParams = {
  title: "???",
  content: "???",
  campaign_id: 0,
  is_required: 1,
  jf_code: "???",
  jf_text: "???",
  group_id: 1,
  position: 0,
  allow_media: 0,
  optimize_media: 0,
};
class Templates extends Table<TemplateParams> {
  protected name = "wp_appq_campaign_task";
  protected columns = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "title VARCHAR(140)",
    "content TEXT",
    "campaign_id INTEGER",
    "is_required INTEGER",
    "jf_code VARCHAR(15)",
    "jf_text VARCHAR(60)",
    "group_id INTEGER DEFAULT 1 NOT NULL",
    "position INTEGER DEFAULT 0 NOT NULL",
    "allow_media INTEGER DEFAULT 0 NOT NULL",
    "optimize_media INTEGER DEFAULT 0 NOT NULL",
  ];
  constructor() {
    super(defaultItem);
  }
}
const templates = new Templates();
export default templates;
export type { TemplateParams };
