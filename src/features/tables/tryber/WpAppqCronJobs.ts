import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_cron_jobs");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_cron_jobs", function (table) {
      table.increments("id").notNullable();
      table.string("display_name").notNullable().defaultTo("");
      table.integer("email_template_id").notNullable();
      table.integer("template_id").notNullable();
      table.string("template_text");
      table.string("template_json");
      table.integer("last_editor_id").notNullable();
      table.integer("campaign_id").notNullable();
      table.timestamp("creation_date").notNullable().defaultTo(tryber.fn.now());
      table.string("update_date").notNullable();
      table.string("executed_on").notNullable();
      table.string("subject");
      table.string("recipients").notNullable().defaultTo("");
      table.string("custom_group");
      table.integer("sender_id");
      table.string("external_data");
      table.integer("group_id");
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_cron_jobs");
  }
}

const item = new Table();

export default item;
