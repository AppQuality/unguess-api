import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_click_day_setup");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_click_day_setup",
      function (table) {
        table.increments("id").notNullable();
        table.integer("campaign_id");
        table.integer("tester_id");
        table.string("code_to_play");
        table.timestamp("creation").notNullable().defaultTo(tryber.fn.now());
        table
          .timestamp("update")
          .notNullable()
          .defaultTo("0000-00-00 00:00:00");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_click_day_setup");
  }
}

const item = new Table();

export default item;
