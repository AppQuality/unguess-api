import sqlite3 from "@src/features/sqlite";

const db = sqlite3("tryber");

class View<T> {
  protected query = "";
  protected name = "my_view";
  constructor() {}
  async mock() {
    await db.createView(this.name, this.query);
  }
  async dropMock() {
    await db.dropView(this.name);
  }

  async all(
    params?: (keyof T)[],
    where?: (T | T[])[],
    limit?: number
  ): Promise<T[]> {
    const keys = params ? params.join(",") : "*";
    let WHERE = "";
    if (where) {
      const orQueries = where.map((item) => {
        if (Array.isArray(item)) {
          return item
            .map(
              (subItem, index) =>
                subItem &&
                `${Object.keys(subItem)[0]}='${Object.values(subItem)[0]}'`
            )
            .join(" OR ");
        }
        return item;
      });
      WHERE = `WHERE ${orQueries
        .map(
          (item, index) =>
            item && `${Object.keys(item)[0]}='${Object.values(item)[0]}'`
        )
        .join(" AND ")}`;
    }
    return await db.all(
      `SELECT ${keys} FROM ${this.name} ${WHERE} ${
        limit ? `LIMIT ${limit}` : ""
      }`
    );
  }
  async first(params?: (keyof T)[], where?: (T | T[])[]): Promise<T> {
    const items = await this.all(params, where, 1);
    return items[0];
  }
}
export default View;
