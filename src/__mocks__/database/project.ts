import sqlite3 from "@src/features/sqlite";

const db = sqlite3("tryber");

export const table = {
  create: async () => {
    await db.createTable("wp_appq_project", [
      "id INTEGER PRIMARY KEY AUTOINCREMENT",
      "display_name varchar(64)",
      "customer_id int(11)",
      "last_edit timestamp",
      "created_on timestamp",
      "edited_by int(11)",
    ]);
  },
  drop: async () => {
    await db.dropTable("wp_appq_project");
  },
  clear: async () => {
    return await db.run(`DELETE FROM wp_appq_project`);
  },
};

const data: {
  [key: string]: (params?: any) => Promise<{ [key: string]: any }>;
} = {};

data.basicProject = async (params) => {
  const item = {
    display_name: "Nome del progetto abbastanza figo",
    last_edit: "2017-07-20 00:00:00",
    ...params,
  };
  await db.insert("wp_appq_project", item);
  return item;
};

export { data };
