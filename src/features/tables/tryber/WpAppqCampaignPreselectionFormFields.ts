import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_campaign_preselection_form_fields");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_campaign_preselection_form_fields",
      function (table) {
        table.increments("id").notNullable();
        table.integer("form_id");
        table.string("question");
        table.string("short_name");
        table.string("type");
        table.string("options");
        table.integer("priority");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_campaign_preselection_form_fields");
  }
}

const item = new Table();

export default item;
