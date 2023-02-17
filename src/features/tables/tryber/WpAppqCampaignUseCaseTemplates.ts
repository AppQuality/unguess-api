import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_campaign_use_case_templates");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_campaign_use_case_templates",
      function (table) {
        table.increments("id").notNullable();
        table.string("admin_title").notNullable();
        table.string("title").notNullable();
        table.string("content").notNullable();
        table.string("jf_code").notNullable();
        table.string("jf_text").notNullable();
        table.integer("is_required").notNullable();
        table.integer("group_id").notNullable().defaultTo(0);
        table.integer("position").notNullable().defaultTo(0);
        table.integer("allow_media").notNullable().defaultTo(0);
        table.integer("max_files");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_campaign_use_case_templates");
  }
}

const item = new Table();

export default item;
