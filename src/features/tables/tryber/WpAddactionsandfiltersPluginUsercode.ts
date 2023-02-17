import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_addactionsandfilters_plugin_usercode");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_addactionsandfilters_plugin_usercode",
      function (table) {
        table.increments("id").notNullable();
        table.integer("enabled").notNullable().defaultTo(0);
        table.integer("shortcode").notNullable().defaultTo(0);
        table.integer("buffer").notNullable().defaultTo(1);
        table.integer("inadmin").notNullable().defaultTo(0);
        table.string("name").notNullable();
        table.string("capability");
        table.string("description").notNullable();
        table.string("code").notNullable();
        table.unique(["id"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_addactionsandfilters_plugin_usercode");
  }
}

const item = new Table();

export default item;
