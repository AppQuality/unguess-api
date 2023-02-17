import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_lc_tasks");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_lc_tasks", function (table) {
      table.increments("id").notNullable();
      table.integer("campaign_id");
      table.integer("pm_id");
      table.string("message");
      table.integer("status").defaultTo(0);
      table.timestamp("task_time").notNullable().defaultTo(tryber.fn.now());
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_lc_tasks");
  }
}

const item = new Table();

export default item;
