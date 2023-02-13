import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_campaign_additional_fields_data");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_campaign_additional_fields_data",
      function (table) {
        table.integer("bug_id").notNullable();
        table.integer("type_id").notNullable();
        table.string("value").notNullable();
        table.unique(["type_id", "bug_id"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_campaign_additional_fields_data");
  }
}

const item = new Table();

export default item;
