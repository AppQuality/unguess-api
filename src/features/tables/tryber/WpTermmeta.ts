import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_termmeta");
  }

  public create() {
    return tryber.schema.createTable("wp_termmeta", function (table) {
      table.increments("meta_id").notNullable();
      table.integer("term_id").notNullable().defaultTo(0);
      table.string("meta_key");
      table.string("meta_value");
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_termmeta");
  }
}

const item = new Table();

export default item;
