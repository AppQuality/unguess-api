const sqlite3 = require("better-sqlite3");

export default (dbname: "unguess" | "tryber") => {
  const db =
    process.env.DEBUG === "1"
      ? new sqlite3(dbname + ".db", { verbose: console.log })
      : new sqlite3(dbname + ".db");
  db.function("NOW", () => "datetime('now')");
  db.function("FROM_UNIXTIME", (value: string) => value);
  db.function("CONCAT", { varargs: true }, (...args: string[]) =>
    args.join("")
  );
  db.function("COALESCE", { varargs: true }, (...args: string[]) =>
    args.find((a: any) => a !== null)
  );
  const mockDb: any = {};
  mockDb.createTable = (table: string, columns: string[]) => {
    return new Promise(async (resolve, reject) => {
      const query = `CREATE TABLE IF NOT EXISTS ${table} (${columns.join(
        ", "
      )});`;
      try {
        await db.exec(query);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  };
  mockDb.dropTable = (table: string) => {
    return new Promise(async (resolve, reject) => {
      const query = `DROP TABLE IF EXISTS ${table};`;
      try {
        await db.exec(query);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  };

  mockDb.createView = (view: string, query: string) => {
    return new Promise(async (resolve, reject) => {
      const queryView = `CREATE VIEW IF NOT EXISTS ${view} AS ${query};`;
      try {
        await db.exec(queryView);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  };

  mockDb.dropView = (view: string) => {
    return new Promise(async (resolve, reject) => {
      const query = `DROP VIEW IF EXISTS ${view};`;
      try {
        await db.exec(query);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  };

  mockDb.all = async (query: string): Promise<any> => {
    try {
      const data = await db.prepare(query).all();
      return data;
    } catch (err) {
      throw err;
    }
  };

  mockDb.get = async (query: string): Promise<any> => {
    return await db.prepare(query).get();
  };

  mockDb.run = async (query: string): Promise<any> => {
    return await db.prepare(query).run();
  };

  mockDb.insert = (table: string, data: any): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      const sql = `INSERT INTO ${table} (${Object.keys(data)
        .map((d) => d)
        .join(",")}) VALUES (${Object.keys(data)
        .map(() => "?")
        .join(",")});`;
      const res = await db.prepare(sql).run(...Object.values(data));
      resolve(res);
    });
  };
  return mockDb;
};
