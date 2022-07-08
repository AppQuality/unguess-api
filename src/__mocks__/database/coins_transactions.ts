import sqlite3 from "@src/features/sqlite";

const db = sqlite3("unguess");

interface transaction {
  id: number;
  customer_id: number;
  profile_id: number;
  quantity: number;
  campaign_id: number;
  coins_package_id: number;
  created_on: string;
  notes: string;
}

export const table = {
  create: async () => {
    await db.createTable("wp_ug_coins_transactions", [
      "id INTEGER PRIMARY KEY AUTOINCREMENT",
      "customer_id int(11) NOT NULL",
      "profile_id int(11) NOT NULL",
      "quantity int(11) NOT NULL",
      "campaign_id int(11) NOT NULL",
      "coins_package_id int(11) NOT NULL",
      "created_on timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP",
      "notes varchar(255) NULL",
    ]);
  },
  drop: async () => {
    await db.dropTable("wp_ug_coins_transactions");
  },
};

const data: {
  [key: string]: (params?: transaction) => Promise<{ [key: string]: any }>;
} = {};

data.basicItem = async (params) => {
  const item = {
    ...params,
  };
  await db.insert("wp_ug_coins_transactions", item);
  return item;
};

export { data };
