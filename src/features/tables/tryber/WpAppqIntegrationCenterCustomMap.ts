import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_integration_center_custom_map");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_integration_center_custom_map",
      function (table) {
        table.integer("campaign_id").notNullable();
        table.string("source").notNullable();
        table.string("name").notNullable();
        table.string("map").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_integration_center_custom_map");
  }
}

const item = new Table();

export default item;
