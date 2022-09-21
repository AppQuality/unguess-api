import mysql from "mysql";

import config from "@src/config";

export const format = (query: string, data: (string | number)[]) =>
  mysql.format(query, data);

export const query = (query: string, dbName: string = ""): Promise<any> => {
  let currentDb = config.db;
  if (dbName == "unguess") currentDb = config.unguessDb;
  const connection = mysql.createConnection(currentDb);
  connection.connect();
  return new Promise((resolve, reject) => {
    return connection.query(query, function (error, results) {
      if (error) return reject(error);
      return resolve(results);
    });
  }).finally(() => connection.end());
};

export const escape = (value: string) => {
  let data = value;

  // Escape single quotes
  data = data.replace(/'/g, "''");

  // Escape double quotes
  data = data.replace(/"/g, "''");

  return data;
};
