import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_click_day_result");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_click_day_result",
      function (table) {
        table.increments("id").notNullable();
        table.string("submission_id");
        table.string("ip");
        table.string("submission_date");
        table.integer("campaign_id");
        table.integer("tester_id");
        table.string("user_email");
        table.string("code_to_play");
        table.string("user_result");
        table.string("user_timestamp");
        table.string("user_image_url");
        table.integer("pm_result");
        table.string("pm_timestamp");
        table.integer("pm_id");
        table.timestamp("creation").notNullable().defaultTo(tryber.fn.now());
        table
          .timestamp("update")
          .notNullable()
          .defaultTo("0000-00-00 00:00:00");
        table.integer("final_result").defaultTo(0);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_click_day_result");
  }
}

const item = new Table();

export default item;
