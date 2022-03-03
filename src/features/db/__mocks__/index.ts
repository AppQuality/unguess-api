import sqlite from "@src/features/sqlite";
import mysql from "mysql";

export const format = (query: string, data: (string | number)[]) =>
  mysql.format(query.replace(/"/g, "'"), data);

export const query = (query: string): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      let data;
      if (
        query.includes("UPDATE") ||
        query.includes("DELETE") ||
        query.includes("INSERT")
      ) {
        data = await sqlite.run(query);
      }
      else {
        data = await sqlite.all(query);
      }

      return resolve(data);
    } catch (error) {
      return reject(error);
    }
  });
};

export const insert = (table: string, data: any): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const sql = "INSERT INTO ?? SET ?";
    const query = mysql.format(sql, [table, data]);
    try {
      const data = await sqlite.run(query);
      resolve(data);
    } catch (error) {
      reject(error);
    }
  });
};
