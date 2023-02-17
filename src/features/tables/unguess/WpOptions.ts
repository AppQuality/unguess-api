import { unguess } from "@src/features/knex";

class Table {
  public do() {
    return unguess("wp_options");
  }

  public create() {
    return unguess.schema.createTable("wp_options", function (table) {
      table.increments("option_id").notNullable();
      table.string("option_name").notNullable().defaultTo("");
      table.string("option_value").notNullable();
      table.string("autoload").notNullable().defaultTo("yes");
      table.unique(["option_name"]);
    });
  }
  public drop() {
    return unguess.schema.dropTable("wp_options");
  }
}

const item = new Table();

export default item;
