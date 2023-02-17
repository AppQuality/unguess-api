import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_campaign_preselection_form");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_campaign_preselection_form",
      function (table) {
        table.increments("id").notNullable();
        table.integer("campaign_id");
        table.string("name");
        table.integer("author");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_campaign_preselection_form");
  }
}

const item = new Table();

export default item;
