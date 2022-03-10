import sqlite from "@src/features/sqlite";
import mysql from "mysql";

const unguessDb = sqlite("unguess.db");
const tryberDb = sqlite("tryber.db");
export const format = (query: string, data: (string | number)[]) =>
  mysql.format(query.replace(/"/g, "'"), data);

export const query = (query: string, db: string): Promise<any> => {
  const myDb = db === "unguess" ? tryberDb : unguessDb;
  return new Promise(async (resolve, reject) => {
    try {
      let data;
      if (
        query.includes("UPDATE") ||
        query.includes("DELETE") ||
        query.includes("INSERT")
      ) {
        data = await myDb.run(query);
      } else {
        data = await myDb.all(query);
      }

      return resolve(data);
    } catch (error) {
      return reject(error);
    }
  });
};

export const insert = (table: string, data: any, db: string): Promise<any> => {
  const myDb = db === "unguess" ? tryberDb : unguessDb;
  return new Promise(async (resolve, reject) => {
    const sql = "INSERT INTO ?? SET ?";
    const query = mysql.format(sql, [table, data]);
    try {
      const data = await myDb.run(query);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};
