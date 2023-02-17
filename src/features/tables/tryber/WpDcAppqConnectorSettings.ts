import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_dc_appq_connector_settings");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_dc_appq_connector_settings",
      function (table) {
        table.increments("id").notNullable();
        table.string("field_name").notNullable();
        table.string("field_value").notNullable();
        table
          .timestamp("creation_date")
          .notNullable()
          .defaultTo(tryber.fn.now());
        table.unique(["field_name"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_dc_appq_connector_settings");
  }
}

const item = new Table();

export default item;
