import sqlite3 from "@src/features/sqlite";

const db = sqlite3("unguess");

interface feature {
  slug: string;
  display_name: string;
}

export const table = {
  create: async () => {
    await db.createTable("wp_ug_features", [
      "id int(11) NOT NULL PRIMARY KEY",
      "slug varchar(128)",
      "display_name vachar(256)",
    ]);
  },
  drop: async () => {
    await db.dropTable("wp_ug_features");
  },
  clear: async () => {
    await db.run("DELETE FROM wp_ug_features");
  },
};

const data: {
  [key: string]: (params?: feature) => Promise<{ [key: string]: any }>;
} = {};

data.basicItem = async (params) => {
  const item = {
    ...params,
  };
  await db.insert("wp_ug_features", item);
  return item;
};

export { data };
