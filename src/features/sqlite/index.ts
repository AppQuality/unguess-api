import { tryber, unguess } from "../database";

export default (dbname: "unguess" | "tryber") => {
  const db = dbname === "unguess" ? unguess : tryber;

  const mockDb: any = {};
  mockDb.createTable = async (table: string, columns: string[]) => {
    await db.raw(
      `CREATE TABLE IF NOT EXISTS ${table} (${columns.join(", ")});`
    );
  };
  mockDb.dropTable = async (table: string) => {
    await db.raw(`DROP TABLE IF EXISTS ${table};`);
  };

  mockDb.createView = async (view: string, query: string) => {
    await db.raw(`CREATE VIEW IF NOT EXISTS ${view} AS ${query};`);
  };

  mockDb.dropView = async (view: string) => {
    await db.raw(`DROP VIEW IF EXISTS ${view};`);
  };

  mockDb.all = async (query: string): Promise<any> => {
    return await db.raw(query);
  };

  mockDb.get = async (query: string): Promise<any> => {
    return await db.raw(query);
  };

  mockDb.run = async (query: string): Promise<any> => {
    return await db.raw(query);
  };

  mockDb.insert = async (table: string, data: any): Promise<any> => {
    const dataKeys = Object.keys(data).filter(
      (d) => typeof data[d] !== "undefined"
    );
    const dataValues = Object.values(data).filter(
      (d) => typeof d !== "undefined"
    );

    try {
      return await db.raw(
        `INSERT INTO ${table} (${dataKeys
          .map((d) => d)
          .join(",")}) VALUES (${dataKeys.map(() => "?").join(",")});`,
        dataValues.map((d: any) => (typeof d !== "undefined" ? d : null))
      );
    } catch (error) {
      throw error;
    }
  };
  return mockDb;
};
