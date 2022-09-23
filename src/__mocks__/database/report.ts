import sqlite3 from "@src/features/sqlite";

const db = sqlite3("tryber");

export const table = {
  create: async () => {
    await db.createTable("wp_appq_report", [
      "id INTEGER PRIMARY KEY AUTOINCREMENT",
      "title VARCHAR(64)",
      "description VARCHAR(255)",
      "campaign_id INT(16)",
      "uploader_id INT(16)",
      "url VARCHAR(255)",
      "creation_date timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP",
      "update_date timestamp NULL",
    ]);
  },
  drop: async () => {
    await db.dropTable("wp_appq_report");
  },
  clear: async () => {
    return await db.run(`DELETE FROM wp_appq_report`);
  },
};

const data: {
  [key: string]: (params?: any) => Promise<{ [key: string]: any }>;
} = {};

data.basicItem = async (params) => {
  const item = {
    title: "Report",
    description: "Description",
    campaign_id: 1,
    uploader_id: 1,
    url: "https://example.com",
    creation_date: "2022-01-01 00:00:00",
    ...params,
  };
  await db.insert("wp_appq_report", item);
  return item;
};

export { data };
