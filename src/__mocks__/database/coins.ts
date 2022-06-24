import sqlite3 from "@src/features/sqlite";

const db = sqlite3("unguess");

interface coin {
  id: number;
  customer_id: number;
  amount: number;
  agreement_id?: number;
  price: number;
  created_on: string;
  updated_on: string;
  notes?: string;
}

export const table = {
  create: async () => {
    await db.createTable("wp_ug_coins", [
      "id int(11) NOT NULL PRIMARY KEY",
      "customer_id int(11) NOT NULL",
      "amount int(11) NOT NULL DEFAULT 0",
      "agreement_id int(11) NULL",
      "price float(6, 2) NOT NULL DEFAULT 0.00",
      "created_on timestamp NOT NULL",
      "updated_on timestamp NOT NULL",
      "notes varchar(255) NULL",
    ]);
  },
  drop: async () => {
    await db.dropTable("wp_ug_coins");
  },
};

const data: {
  [key: string]: (params?: coin) => Promise<{ [key: string]: any }>;
} = {};

data.basicItem = async (params) => {
  const item = {
    ...params,
  };
  await db.insert("wp_ug_coins", item);
  return item;
};

export { data };
