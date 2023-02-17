import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_crowd_appq_has_candidate");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_crowd_appq_has_candidate",
      function (table) {
        table.integer("user_id").notNullable();
        table.integer("campaign_id").notNullable();
        table
          .timestamp("subscription_date")
          .notNullable()
          .defaultTo(tryber.fn.now());
        table.integer("accepted");
        table.string("devices").notNullable().defaultTo(0);
        table.integer("selected_device").notNullable().defaultTo(0);
        table.integer("results").notNullable().defaultTo(0);
        table.timestamp("modified");
        table.integer("group_id").notNullable().defaultTo(1);
        table.unique(["subscription_date", "user_id", "campaign_id"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_crowd_appq_has_candidate");
  }
}

const item = new Table();

export default item;
