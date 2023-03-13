import Table from "./unguess_table";

interface CampaignReadStatusParams {
  id?: number;
  unguess_wp_user_id?: number;
  campaign_id?: number;
  is_read?: 1 | 0;
  read_on?: string;
  last_read_on?: string;
}

const defaultItem: CampaignReadStatusParams = {
  id: 1,
  unguess_wp_user_id: 1,
  campaign_id: 1,
  is_read: 0,
};

class CampaignReadStatuses extends Table<CampaignReadStatusParams> {
  protected name = "wp_ug_campaign_read_status";
  protected columns = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "unguess_wp_user_id INTEGER ",
    "campaign_id INTEGER ",
    "is_read TINYINT(1) ",
    "read_on TIMESTAMP ",
    "last_read_on TIMESTAMP ",
  ];
  constructor() {
    super(defaultItem);
  }
}

const campaignReadStatuses = new CampaignReadStatuses();
export default campaignReadStatuses;
export type { CampaignReadStatusParams };
