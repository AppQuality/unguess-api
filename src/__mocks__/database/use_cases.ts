import Table from "./tryber_table";

type UseCaseParams = {
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
  simple_title?: string;
  info?: string;
  prefix?: string;
};

const defaultItem: UseCaseParams = {
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
  simple_title: "",
  info: "",
  prefix: "",
};
class UseCases extends Table<UseCaseParams> {
  protected name = "wp_appq_campaign_task";
  protected columns = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "title VARCHAR(512)",
    "content TEXT",
    "campaign_id INTEGER",
    "is_required INTEGER",
    "jf_code VARCHAR(15)",
    "jf_text VARCHAR(60)",
    "group_id INTEGER DEFAULT 1 NOT NULL",
    "position INTEGER DEFAULT 0 NOT NULL",
    "allow_media INTEGER DEFAULT 0 NOT NULL",
    "optimize_media INTEGER DEFAULT 0 NOT NULL",
    "simple_title VARCHAR(128) NOT NULL",
    "info VARCHAR(256) NOT NULL",
    "prefix VARCHAR(128) NOT NULL",
  ];
  constructor() {
    super(defaultItem);
  }
}
const useCases = new UseCases();
export default useCases;
export type { UseCaseParams };
