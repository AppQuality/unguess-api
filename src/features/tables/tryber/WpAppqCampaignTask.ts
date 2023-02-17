import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_campaign_task");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_campaign_task", function (table) {
      table.increments("id").notNullable();
      table.string("title").notNullable();
      table.string("content").notNullable();
      table.string("jf_code").notNullable();
      table.integer("campaign_id").notNullable();
      table.integer("is_required").notNullable();
      table.string("jf_text").notNullable();
      table.integer("group_id").notNullable().defaultTo(1);
      table.integer("position").notNullable().defaultTo(0);
      table.integer("allow_media").notNullable().defaultTo(0);
      table.integer("max_files");
      table.integer("cluster_id").notNullable().defaultTo(0);
      table.integer("optimize_media").notNullable().defaultTo(0);
      table.string("simple_title").notNullable();
      table.string("info").notNullable();
      table.string("prefix").notNullable();
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_campaign_task");
  }
}

const item = new Table();

export default item;
