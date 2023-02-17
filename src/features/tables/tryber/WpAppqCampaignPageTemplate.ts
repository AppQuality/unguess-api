import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_campaign_page_template");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_campaign_page_template",
      function (table) {
        table.increments("id").notNullable();
        table.string("display_name").notNullable();
        table.string("wp_template_name").notNullable();
        table.integer("template_type").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_campaign_page_template");
  }
}

const item = new Table();

export default item;
