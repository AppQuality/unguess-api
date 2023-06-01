import mysql from "mysql";
import { tryber, unguess } from "../database";

export const format = (query: string, data: (string | number)[]) =>
  mysql.format(query, data);

export const query = async (
  query: string,
  dbName: string = ""
): Promise<any> => {
  const db = dbName == "unguess" ? unguess : tryber;
  const res = await db.raw(query);

  return res ? res[0] : [];
};

export const escape = (value: string) => {
  let data = value;

  // Escape single quotes
  data = data.replace(/'/g, "''");

  // Escape double quotes
  data = data.replace(/"/g, "''");

  return data;
};
