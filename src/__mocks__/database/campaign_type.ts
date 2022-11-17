import sqlite3 from "@src/features/sqlite";

const db = sqlite3("tryber");

export const table = {
  create: async () =>
    await db.createTable("wp_appq_campaign_type", [
      "id int(11)",
      "name varchar(45)",
      "type int(11)",
    ]),
  drop: async () => {
    await db.dropTable("wp_appq_campaign_type");
  },
  clear: async () => {
    await db.run("DELETE FROM wp_appq_campaign_type");
  },
};

const data: {
  [key: string]: (params?: any) => Promise<{ [key: string]: any }>;
} = {};

data.basicItem = async (params) => {
  const item = {
    id: 1,
    name: "Banana campaign",
    type: 1,
    ...params,
  };
  await db.insert("wp_appq_campaign_type", item);
  return item;
};

export { data };
