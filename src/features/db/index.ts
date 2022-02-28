import mysql from 'mysql';

import config from '../../config';

export const format = (query: string, data: (string | number)[]) =>
  mysql.format(query, data);

export const query = (query: string): Promise<any> => {
  const connection = mysql.createConnection(config.db);
  connection.connect();
  return new Promise((resolve, reject) => {
    return connection.query(query, function (error, results) {
      if (error) return reject(error);
      return resolve(results);
    });
  }).finally(() => connection.end());
};
