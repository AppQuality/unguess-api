import sqlite3 from "@src/features/sqlite";

const db = sqlite3("unguess");

interface userToFeature {
  unguess_wp_user_id: number;
  feature_id: number;
}

export const table = {
  create: async () => {
    await db.createTable("wp_ug_user_to_feature", [
      "unguess_wp_user_id int(11) NOT NULL",
      "feature_id int(11) NOT NULL",
    ]);
  },
  drop: async () => {
    await db.dropTable("wp_ug_user_to_feature");
  },
  clear: async () => {
    await db.run("DELETE FROM wp_ug_user_to_feature");
  },
};

const data: {
  [key: string]: (params?: userToFeature) => Promise<{ [key: string]: any }>;
} = {};

data.basicItem = async (params) => {
  const item = {
    ...params,
  };
  await db.insert("wp_ug_user_to_feature", item);
  return item;
};

export { data };
