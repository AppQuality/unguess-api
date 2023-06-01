import Table from "./tryber_table";

type CampaignsParams = {
  id?: number;
  start_date?: string;
  end_date?: string;
  close_date?: string;
  title?: string;
  customer_title?: string;
  description?: string;
  status_id?: number;
  is_public?: number;
  campaign_type_id?: number;
  project_id?: number;
  customer_id?: number;
  cust_bug_vis?: number;
  base_bug_internal?: string;
  campaign_type?: number;
  pm_id?: number;
  platform_id?: number;
  os?: string;
  form_factor?: string;
  page_preview_id?: number;
  page_manual_id?: number;
};
const defaultItem: CampaignsParams = {
  id: 1,
  start_date: "2017-07-20 00:00:00",
  end_date: "2017-07-20 00:00:00",
  close_date: "2017-07-20 00:00:00",
  title: "Campagnetta Funzionale Provetta",
  customer_title: "titolo",
  description: "Descrizione della campagnazione",
  status_id: 1,
  is_public: 0,
  campaign_type_id: 1,
  project_id: 1,
  customer_id: 2,
  cust_bug_vis: 0,
  platform_id: 1,
  page_preview_id: 1,
  page_manual_id: 1,
  pm_id: 1,
};

class Campaigns extends Table<CampaignsParams> {
  protected name = "wp_appq_evd_campaign";
  protected columns = [
    "id INTEGER PRIMARY KEY AUTOINCREMENT",
    "start_date datetime",
    "end_date datetime",
    "close_date datetime",
    "title varchar(256)",
    "customer_title varchar(256)",
    "description varchar(512)",
    "base_bug_internal_id varchar(45)",
    "status_id int(1)",
    "is_public int(1)",
    "campaign_type_id int(11)",
    "project_id int(11)",
    "customer_id int(11)",
    "campaign_type int(1) default 0",
    "pm_id int(11)",
    "platform_id int(11)",
    "os varchar(256) default '0'",
    "form_factor varchar(256) default '0'",
    "page_preview_id int(11)",
    "page_manual_id int(11)",
    "cust_bug_vis int(1) default '0'",
  ];
  constructor() {
    super(defaultItem);
  }
}
const campaigns = new Campaigns();
export default campaigns;
export type { CampaignsParams };
export { data };

// Backward compatibility
const data = {
  basicCampaign: async (params: CampaignsParams) => {
    return await campaigns.insert({
      ...params,
    });
  },
};
