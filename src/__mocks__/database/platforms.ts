import sqlite3 from "@src/features/sqlite";

const db = sqlite3("tryber");

interface platform {
  id: number;
  name: string;
  form_factor?: number;
  architecture?: number;
}

export const table = {
  create: async () => {
    await db.createTable("wp_appq_evd_platform", [
      "id int(11)",
      "name varchar(45)",
      "form_factor int(11) DEFAULT 0",
      "architecture int(11) DEFAULT 0",
    ]);
  },
  drop: async () => {
    await db.dropTable("wp_appq_evd_platform");
  },
  clear: async () => {
    await db.run("DELETE FROM wp_appq_evd_platform");
  },
};

const data: {
  [key: string]: (params?: platform) => Promise<{ [key: string]: any }>;
} = {};

data.addItem = async (params) => {
  const item = {
    architecture: 0,
    ...params,
  };
  await db.insert("wp_appq_evd_platform", item);
  return item;
};

export { data };
