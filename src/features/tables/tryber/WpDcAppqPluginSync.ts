import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_dc_appq_plugin_sync");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_dc_appq_plugin_sync",
      function (table) {
        table.increments("id").notNullable();
        table.integer("is_auto_sync").notNullable().defaultTo(0);
        table.integer("is_successfully").notNullable().defaultTo(0);
        table.string("error_message").notNullable().defaultTo("--");
        table.integer("devices_updated").notNullable().defaultTo(0);
        table.timestamp("sync_date").notNullable().defaultTo(tryber.fn.now());
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_dc_appq_plugin_sync");
  }
}

const item = new Table();

export default item;
