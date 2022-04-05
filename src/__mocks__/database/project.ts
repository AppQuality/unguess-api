import sqlite3 from "@src/features/sqlite";

const db = sqlite3("tryber");

export const table = {
  create: async () => {
    await db.createTable("wp_appq_project", [
      "id int(11) PRIMARY KEY",
      "display_name varchar(64)",
      "customer_id int(11)",
      "edited_by int(11)",
      "created_on timestamp",
      "last_edit timestamp",
    ]);
  },
  drop: async () => {
    await db.dropTable("wp_appq_project");
  },
};

const data: {
  [key: string]: (params?: any) => Promise<{ [key: string]: any }>;
} = {};

data.basicProject = async (params) => {
  const item = {
    display_name: "Nome del progetto abbastanza figo",
    customer_id: 123,
    edited_by: 42,
    created_on: "2017-07-20 00:00:00",
    last_edit: "2017-07-20 00:00:00",
    ...params,
  };
  await db.insert("wp_appq_project", item);
  return item;
};

export { data };
