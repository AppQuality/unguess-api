import sqlite3 from "@src/features/sqlite";

const db = sqlite3("tryber");

export const table = {
  create: async () => {
    await db.createTable("wp_appq_evd_profile", [
      "id INTEGER PRIMARY KEY",
      "name VARCHAR(255)",
      "surname VARCHAR(255)",
      "email VARCHAR(255)",
      "wp_user_id INTEGER ",
      "is_verified INTEGER DEFAULT 0",
      "blacklisted INTEGER DEFAULT 1",
    ]);
  },
  drop: async () => {
    await db.dropTable("wp_appq_evd_profile");
  },
  clear: async () => {
    await db.run("DELETE FROM wp_appq_evd_profile");
  },
};

const data: {
  [key: string]: (params?: any) => Promise<{ [key: string]: any }>;
} = {};

data.basicCustomer = async (params) => {
  const item = {
    name: "Mario",
    surname: "Rossi",
    email: "mario.rossi@example.com",
    wp_user_id: 1,
    is_verified: 1,
    ...params,
  };
  await db.insert("wp_appq_evd_profile", item);
  return item;
};

export { data };
