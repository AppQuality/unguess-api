import sqlite3 from "@src/features/sqlite";

const tableName = "wp_users";
const db = sqlite3("tryber");

export const table = {
  create: async () => {
    await db.createTable(tableName, [
      "ID INTEGER PRIMARY KEY",
      "user_login VARCHAR(60)",
      "user_pass VARCHAR(255)",
      "user_email VARCHAR(100)",
      "user_url VARCHAR(100)",
    ]);
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
    user_login: "customer@unguess.io",
    user_pass: "password",
    user_email: "customer@unguess.io",
    ...params,
  };
  await db.insert(tableName, item);
  return item;
};

export { data };
