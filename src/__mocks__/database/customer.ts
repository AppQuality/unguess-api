import sqlite3 from "@src/features/sqlite";

const db = sqlite3("tryber");

export const table = {
  create: async () => {
    await db.createTable("wp_appq_customer", [
      "id int(11) PRIMARY KEY",
      "company varchar(64)",
      "company_logo varchar(300)",
      "tokens int(11)",
      "pm_id int(11) DEFAULT NULL",
    ]);
  },
  drop: async () => {
    await db.dropTable("wp_appq_customer");
  },
};

const data: {
  [key: string]: (params?: any) => Promise<{ [key: string]: any }>;
} = {};

data.basicItem = async (params) => {
  const item = {
    company: "Company",
    company_logo: "logo.png",
    tokens: 100,
    ...params,
  };
  await db.insert("wp_appq_customer", item);
  return item;
};

export { data };
