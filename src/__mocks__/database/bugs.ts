import Table from "./tryber_table";

type BugsParams = {
  id?: number;
  internal_id?: string;
  wp_user_id?: number;
  message?: string;
  description?: string;
  expected_result?: string;
  current_result?: string;
  campaign_id?: number;
  status_id?: number;
  publish?: number;
  status_reason?: string;
  severity_id?: number;
  created?: string;
  updated?: string;
  bug_replicability_id?: number;
  bug_type_id?: number;
  application_section?: string;
  application_section_id?: number;
  note?: string;
  last_seen?: string;
  dev_id?: number;
  manufacturer?: string;
  model?: string;
  os?: string;
  os_version?: string;
  reviewer?: number;
  is_perfect?: number;
  last_editor_id?: number;
  last_editor_is_tester?: number;
  is_duplicated?: number;
  duplicated_of_id?: number;
  is_favorite?: number;
};

const defaultItem: BugsParams = {
  message: "???",
  description: "???",
  expected_result: "???",
  current_result: "???",
  campaign_id: 0,
  status_id: 0,
  status_reason: "???",
  application_section: "???",
  note: "???",
  manufacturer: "???",
  model: "???",
  os: "???",
  os_version: "???",
};
class Bugs extends Table<BugsParams> {
  protected name = "wp_appq_evd_bug";
  protected columns = [
    "id INTEGER PRIMARY KEY NOT NULL",
    "internal_id VARCHAR(45)",
    "wp_user_id INTEGER(20) NOT NULL",
    "message VARCHAR(256)",
    "description TEXT",
    "expected_result VARCHAR(3000)",
    "current_result VARCHAR(3000)",
    "campaign_id INTEGER",
    "status_id INTEGER",
    "publish INTEGER DEFAULT 1",
    "status_reason VARCHAR(3000)",
    "severity_id INTEGER DEFAULT 1",
    "created datetime NOT NULL DEFAULT CURRENT_TIMESTAMP",
    "updated datetime",
    "bug_replicability_id INTEGER",
    "bug_type_id INTEGER",
    "application_section VARCHAR(512)",
    "application_section_id INTEGER DEFAULT -1",
    "note VARCHAR(3000)",
    "last_seen VARCHAR(30)",
    "dev_id INTEGER",
    "manufacturer VARCHAR(65)",
    "model VARCHAR(65)",
    "os VARCHAR(45)",
    "os_version VARCHAR(45)",
    "reviewer INTEGER",
    "is_perfect INTEGER DEFAULT 1",
    "last_editor_id INTEGER",
    "last_editor_is_tester INTEGER DEFAULT 0",
    "is_duplicated INTEGER DEFAULT 0",
    "duplicated_of_id INTEGER",
    "is_favorite INTEGER DEFAULT 0",
  ];
  constructor() {
    super(defaultItem);
  }
}
const bugs = new Bugs();
export default bugs;
export type { BugsParams };
