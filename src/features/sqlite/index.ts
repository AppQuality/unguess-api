const sqlite3 = require("better-sqlite3");

const db = new sqlite3(":memory:");
db.function("NOW", () => "datetime('now')");
db.function("CONCAT", { varargs: true }, (...args: string[]) => args.join(""));

const mockDb: any = {};

const originalRun = db.run.bind(db);
db.run = (query: string) => {
  return new Promise((resolve, reject) => {
    return originalRun(query, function (err: any) {
      if (err) {
        reject(err.message);
      }
      //@ts-ignore
      if (this && this.lastID) {
        //@ts-ignore
        resolve(this.lastID);
      }
      resolve(true);
    });
  });
};

db.createTable = (table: string, columns: string[]) => {
  const query = `CREATE TABLE IF NOT EXISTS ${table} (${columns.join(", ")});`;
  return db.run(query);
};
db.dropTable = (table: string) => {
  const query = `DROP TABLE IF EXISTS ${table};`;
  return db.run(query);
};
db.insert = (table: string, data: { [key: string]: any }) => {
  const query = `
    INSERT INTO ${table} (${Object.keys(data).join(
    ", "
  )}) VALUES ("${Object.values(data).join('", "')}");`;
  return db.run(query);
};

export default db;