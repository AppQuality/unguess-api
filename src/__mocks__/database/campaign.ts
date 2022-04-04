import sqlite3 from "@src/features/sqlite";

const db = sqlite3("tryber");

export const table = {
  create: async () => {
    await db.createTable("wp_appq_evd_campaign", [
      "id int(11) PRIMARY KEY",
      "start_date datetime",
      "end_date datetime",
      "close_date datetime",
      "title varchar(256)",
      "customer_title varchar(256)",
      "description varchar(512)",
      "status_id int(1)",
      "is_public int(1)",
      "campaign_type_id int(11)",
      "project_id int(11)",
      "customer_id int(11)",
    ]);
  },
  drop: async () => {
    await db.dropTable("wp_appq_evd_campaign");
  },
};

const data: {
  [key: string]: (params?: any) => Promise<{ [key: string]: any }>;
} = {};

data.basicCampaign = async (params) => {
  const item = {
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
    ...params,
  };
  await db.insert("wp_appq_evd_campaign", item);
  return item;
};

export { data };
