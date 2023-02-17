import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_campaign_category");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_campaign_category",
      function (table) {
        table.increments("id").notNullable();
        table.string("name").notNullable();
        table.string("tester_selection_xls").notNullable();
        table.integer("manual_template_id").notNullable();
        table.integer("preview_template_id").notNullable();
        table.string("mailmerge_template_ids").notNullable();
        table.string("use_case_template_ids").notNullable();
        table.string("tester_coach_ids").notNullable();
        table.string("automatic_user_olp_ids").notNullable();
        table.string("automatic_olps").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_campaign_category");
  }
}

const item = new Table();

export default item;
