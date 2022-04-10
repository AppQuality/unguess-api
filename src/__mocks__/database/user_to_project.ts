import sqlite3 from "@src/features/sqlite";

const db = sqlite3("tryber");

interface user_to_project {
  wp_user_id: number;
  project_id: number;
}

export const table = {
  create: async () => {
    await db.createTable("wp_appq_user_to_project", [
      "wp_user_id int(11)",
      "project_id int(11)",
    ]);
  },
  drop: async () => {
    await db.dropTable("wp_appq_user_to_project");
  },
};

const data: {
  [key: string]: (params?: user_to_project) => Promise<{ [key: string]: any }>;
} = {};

data.basicItem = async (params) => {
  const item = {
    ...params,
  };
  await db.insert("wp_appq_user_to_project", item);
  return item;
};

export { data };
