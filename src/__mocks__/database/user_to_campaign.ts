import Table from "./tryber_table";

type UserToCampaignParams = {
  wp_user_id?: number;
  campaign_id?: number;
};
const defaultItem: UserToCampaignParams = {
  wp_user_id: 1,
  campaign_id: 1,
};

class UserToCampaigns extends Table<UserToCampaignParams> {
  protected name = "wp_appq_user_to_campaign";
  protected columns = ["wp_user_id int(11)", "campaign_id int(11)"];
  constructor() {
    super(defaultItem);
  }
}
const userToCampaigns = new UserToCampaigns();
export default userToCampaigns;
export type { UserToCampaignParams };

// Backward compatibility
const data = {
  basicItem: async (params: UserToCampaignParams) => {
    return await userToCampaigns.insert(params);
  },
};

export { data };
