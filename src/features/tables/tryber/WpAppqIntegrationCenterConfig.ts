import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_integration_center_config");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_integration_center_config",
      function (table) {
        table.integer("campaign_id").notNullable();
        table.string("integration").notNullable();
        table.string("endpoint");
        table.string("apikey");
        table.string("field_mapping");
        table.integer("is_active").defaultTo(0);
        table.integer("upload_media").defaultTo(1);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_integration_center_config");
  }
}

const item = new Table();

export default item;
