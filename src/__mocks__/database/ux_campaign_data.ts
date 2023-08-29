import Table from "./tryber_table";

type UxCampaignDataParams = {
  id?: number;
  campaign_id?: number;
  version?: number;
  published?: number;
  methodology_description?: string;
  methodology_type?: string;
  goal?: string;
  users?: number;
  modification_time?: string;
  created_time?: string;
};

const defaultItem: UxCampaignDataParams = {
  campaign_id: 1,
  version: 1,
  published: 1,
  methodology_description: "methodology description",
  methodology_type: "methodology type",
  goal: "goal",
  users: 10,
};
class UserTaskMedia extends Table<UxCampaignDataParams> {
  protected name = "ux_campaign_data";
  protected columns = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "campaign_id INTEGER NOT NULL",
    "version INTEGER NOT NULL",
    "published INTEGER(1) NOT NULL",
    "methodology_description VARCHAR(255)",
    "methodology_type VARCHAR(255)",
    "goal VARCHAR(255)",
    "users INTEGER(4) NOT NULL",
    "modification_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
    "created_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
  ];
  constructor() {
    super(defaultItem);
  }
}

const uxCampaignData = new UserTaskMedia();
export default uxCampaignData;
export type { UxCampaignDataParams };
