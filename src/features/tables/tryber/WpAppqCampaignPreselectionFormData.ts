import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_campaign_preselection_form_data");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_campaign_preselection_form_data",
      function (table) {
        table.increments("id").notNullable();
        table.integer("campaign_id");
        table.integer("field_id");
        table.string("value");
        table.integer("tester_id");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_campaign_preselection_form_data");
  }
}

const item = new Table();

export default item;
