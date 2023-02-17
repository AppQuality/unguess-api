import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_lc_messages");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_lc_messages", function (table) {
      table.increments("id").notNullable();
      table.integer("campaign_id");
      table.integer("tester_id");
      table.integer("is_pm");
      table.integer("is_read").defaultTo(0);
      table.string("message");
      table.timestamp("msg_time").notNullable().defaultTo(tryber.fn.now());
      table.integer("always_visible").defaultTo(0);
      table.integer("is_popup").defaultTo(0);
      table.integer("pm_id").defaultTo(0);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_lc_messages");
  }
}

const item = new Table();

export default item;
