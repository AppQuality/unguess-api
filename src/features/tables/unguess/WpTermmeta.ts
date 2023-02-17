import { unguess } from "@src/features/knex";

class Table {
  public do() {
    return unguess("wp_termmeta");
  }

  public create() {
    return unguess.schema.createTable("wp_termmeta", function (table) {
      table.increments("meta_id").notNullable();
      table.integer("term_id").notNullable().defaultTo(0);
      table.string("meta_key");
      table.string("meta_value");
    });
  }
  public drop() {
    return unguess.schema.dropTable("wp_termmeta");
  }
}

const item = new Table();

export default item;
