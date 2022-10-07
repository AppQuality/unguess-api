import Table from "./tryber_table";

type ReportParams = {
  id?: number;
  title?: string;
  description?: string;
  campaign_id?: number;
  uploader_id?: number;
  url?: string;
  creation_date?: string;
  update_date?: string;
};

const defaultItem: ReportParams = {
  title: "???",
  description: "???",
};
class Reports extends Table<ReportParams> {
  protected name = "wp_appq_report";
  protected columns = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "title VARCHAR(64)",
    "description VARCHAR(255)",
    "campaign_id INT(16)",
    "uploader_id INT(16)",
    "url VARCHAR(255) NULL",
    "creation_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP",
    "update_date timestamp NULL",
  ];
  constructor() {
    super(defaultItem);
  }
}
const reports = new Reports();
export default reports;
export type { ReportParams };
