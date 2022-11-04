import Table from "./tryber_table";

type CampaignMetaParams = {
  meta_id?: number;
  campaign_id?: number;
  meta_key?: string;
  meta_value?: string;
};

const defaultItem: CampaignMetaParams = {
  meta_id: 1,
  campaign_id: 1,
  meta_key: "meta key",
  meta_value: "meta value",
};
class CampaignMeta extends Table<CampaignMetaParams> {
  protected name = "wp_appq_cp_meta";
  protected columns = [
    "meta_id INTEGER PRIMARY KEY AUTOINCREMENT",
    "campaign_id INTEGER NOT NULL DEFAULT 0",
    "meta_key varchar(255)",
    "meta_value TEXT",
  ];
  constructor() {
    super(defaultItem);
  }
}
const cp_meta = new CampaignMeta();
export default cp_meta;
export type { CampaignMeta };
