import { unguess, tryber } from "./database";
describe("database", () => {
  it("should return a knex instance", () => {
    expect(unguess).toBeInstanceOf(Object);
    expect(tryber).toBeInstanceOf(Object);
  });

  it("should have valid config", () => {
    expect(unguess).toHaveProperty("tables");
    expect(unguess).toHaveProperty("raw");

    expect(tryber).toHaveProperty("tables");
    expect(tryber).toHaveProperty("raw");
    expect(tryber.tables).toHaveProperty("KnexMigrations");
  });
});
