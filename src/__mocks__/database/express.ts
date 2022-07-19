import sqlite3 from "@src/features/sqlite";

const db = sqlite3("unguess");

interface express {
  id: number;
  slug: string;
  cost: number;
}

export const table = {
  create: async () => {
    await db.createTable("wp_ug_express", [
      "id INTEGER PRIMARY KEY AUTOINCREMENT",
      "slug varchar(64) NOT NULL",
      "cost float(6, 2) NOT NULL DEFAULT 0.00",
    ]);
  },
  drop: async () => {
    await db.dropTable("wp_ug_express");
  },
};

const data: {
  [key: string]: (params?: express) => Promise<{ [key: string]: any }>;
} = {};

data.basicItem = async (params) => {
  const item = {
    ...params,
  };
  await db.insert("wp_ug_express", item);
  return item;
};

export { data };
