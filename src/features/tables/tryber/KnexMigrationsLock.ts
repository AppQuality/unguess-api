import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("knex_migrations_lock");
  }

  public create() {
    return tryber.schema.createTable("knex_migrations_lock", function (table) {
      table.increments("index").notNullable();
      table.integer("is_locked");
    });
  }
  public drop() {
    return tryber.schema.dropTable("knex_migrations_lock");
  }
}

const item = new Table();

export default item;
