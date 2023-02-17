import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_campaign_page_template_part");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_campaign_page_template_part",
      function (table) {
        table.increments("id").notNullable();
        table.string("field_name").notNullable();
        table.string("type").notNullable();
        table.string("extra");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_campaign_page_template_part");
  }
}

const item = new Table();

export default item;
