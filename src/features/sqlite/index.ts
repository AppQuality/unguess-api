import sqlite3 from "better-sqlite3";

class Databases {
  public tryberDb: any;
  public unguessDb: any;

  constructor(debug: boolean = false) {
    this.tryberDb = new sqlite3(
      "tryber.db",
      debug ? { verbose: console.log } : {}
    );
    this.addFunctions(this.tryberDb);

    this.unguessDb = new sqlite3(
      "unguess.db",
      debug ? { verbose: console.log } : {}
    );
    this.addFunctions(this.unguessDb);
  }

  private addFunctions(db: any) {
    db.function("NOW", () => "datetime('now')");
    db.function("FROM_UNIXTIME", (value: string) => value);
    db.function("CONCAT", { varargs: true }, (...args: string[]) =>
      args.join("")
    );
    db.function("COALESCE", { varargs: true }, (...args: string[]) =>
      args.find((a: any) => a !== null)
    );
  }
}

const databases = new Databases(process.env.DEBUG === "1");

export default (dbname: "unguess" | "tryber") => {
  const db = dbname === "unguess" ? databases.unguessDb : databases.tryberDb;

  const mockDb: any = {};
  mockDb.createTable = async (table: string, columns: string[]) => {
    await db.exec(
      `CREATE TABLE IF NOT EXISTS ${table} (${columns.join(", ")});`
    );
  };
  mockDb.dropTable = async (table: string) => {
    await db.exec(`DROP TABLE IF EXISTS ${table};`);
  };

  mockDb.createView = async (view: string, query: string) => {
    await db.exec(`CREATE VIEW IF NOT EXISTS ${view} AS ${query};`);
  };

  mockDb.dropView = async (view: string) => {
    await db.exec(`DROP VIEW IF EXISTS ${view};`);
  };

  mockDb.all = async (query: string): Promise<any> => {
    return await db.prepare(query).all();
  };

  mockDb.get = async (query: string): Promise<any> => {
    return await db.prepare(query).get();
  };

  mockDb.run = async (query: string): Promise<any> => {
    return await db.prepare(query).run();
  };

  mockDb.insert = async (table: string, data: any): Promise<any> => {
    return await db
      .prepare(
        `INSERT INTO ${table} (${Object.keys(data)
          .map((d) => d)
          .join(",")}) VALUES (${Object.keys(data)
          .map(() => "?")
          .join(",")});`
      )
      .run(...Object.values(data));
  };
  return mockDb;
};
