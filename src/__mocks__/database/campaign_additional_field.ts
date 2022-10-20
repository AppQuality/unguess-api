import Table from "./tryber_table";

type CampaingAdditionalFieldsParams = {
  id?: number;
  cp_id?: number;
  slug?: string;
  title?: string;
  type?: "regex" | "select";
  validation?: string;
  error_message?: string;
  stats?: boolean;
};

const defaultItem: CampaingAdditionalFieldsParams = {
  slug: "???",
  title: "???",
  type: "regex",
  validation: "???",
  error_message: "???",
};

class AdditionalFields extends Table<CampaingAdditionalFieldsParams> {
  protected name = "wp_appq_campaign_additional_fields";
  protected columns = [
    "id INTEGER PRIMARY KEY NOT NULL",
    "cp_id INTEGER NOT NULL",
    "slug VARCHAR(32)",
    "title VARCHAR(32)",
    "type ENUM('regex', 'select') DEFAULT 'regex'",
    "validation VARCHAR(512)",
    "error_message VARCHAR(512)",
    "stats TINYINT(1) DEFAULT 1",
  ];
  constructor() {
    super(defaultItem);
  }
}
const additionalFields = new AdditionalFields();
export default additionalFields;
export type { CampaingAdditionalFieldsParams };
