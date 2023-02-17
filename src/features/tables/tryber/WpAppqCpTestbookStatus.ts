import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_cp_testbook_status");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_cp_testbook_status",
      function (table) {
        table.increments("id").notNullable();
        table.string("display_name").notNullable();
        table.string("to_trigger").notNullable();
        table.string("style").notNullable().defaultTo("info");
        table.string("icon").notNullable().defaultTo("fa-ban");
        table.string("abbr").notNullable().defaultTo("V");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_cp_testbook_status");
  }
}

const item = new Table();

export default item;
