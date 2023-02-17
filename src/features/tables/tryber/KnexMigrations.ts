import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("knex_migrations");
  }

  public create() {
    return tryber.schema.createTable("knex_migrations", function (table) {
      table.increments("id").notNullable();
      table.string("name");
      table.integer("batch");
      table.timestamp("migration_time");
    });
  }
  public drop() {
    return tryber.schema.dropTable("knex_migrations");
  }
}

const item = new Table();

export default item;
