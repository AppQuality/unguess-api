import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_campaign_page_template_part_data");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_campaign_page_template_part_data",
      function (table) {
        table.increments("id").notNullable();
        table.integer("campaign_page_template_id").notNullable();
        table.integer("campaign_page_template_part_id").notNullable();
        table.string("field_default_value");
        table.string("locale");
        table.unique([
          "campaign_page_template_id",
          "locale",
          "campaign_page_template_part_id",
        ]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_campaign_page_template_part_data");
  }
}

const item = new Table();

export default item;
