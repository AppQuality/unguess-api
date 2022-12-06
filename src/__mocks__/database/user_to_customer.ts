import sqlite3 from "@src/features/sqlite";

const db = sqlite3("tryber");

interface user_to_customer {
  wp_user_id: number;
  customer_id: number;
}

export const table = {
  create: async () => {
    await db.createTable("wp_appq_user_to_customer", [
      "wp_user_id int(11)",
      "customer_id int(11)",
    ]);
  },
  drop: async () => {
    await db.dropTable("wp_appq_user_to_customer");
  },
  clear: async () => {
    await db.run("DELETE FROM wp_appq_user_to_customer");
  },
};

const data: {
  [key: string]: (params?: user_to_customer) => Promise<{ [key: string]: any }>;
} = {};

data.basicItem = async (params) => {
  const item = {
    ...params,
  };
  await db.insert("wp_appq_user_to_customer", item);
  return item;
};

export { data };
