import sqlite3 from "@src/features/sqlite";

const tableName = "wp_users";
const db = sqlite3("unguess");

export const table = {
  create: async () => {
    await db.createTable(tableName, ["ID INTEGER PRIMARY KEY"]);
  },
  drop: async () => {
    await db.dropTable(tableName);
  },
};

type WpUsersParams = {
  ID?: number;
};
const data: {
  [key: string]: (params?: WpUsersParams) => Promise<{ [key: string]: any }>;
} = {};

data.basicUser = async (params?: WpUsersParams) => {
  const item = {
    ID: 1,
    ...params,
  };
  await db.insert(tableName, item);
  return item;
};

export { data };
