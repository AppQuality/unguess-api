import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_report");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_report", function (table) {
      table.increments("id").notNullable();
      table.string("title").notNullable();
      table.integer("campaign_id");
      table.integer("uploader_id");
      table.string("description");
      table.string("url");
      table.datetime("creation_date").notNullable().defaultTo(tryber.fn.now());
      table.datetime("update_date");
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_report");
  }
}

const item = new Table();

export default item;
