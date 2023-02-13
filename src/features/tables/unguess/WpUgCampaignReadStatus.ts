import { unguess } from "@src/features/knex";

class Table {
  public do() {
    return unguess("wp_ug_campaign_read_status");
  }

  public create() {
    return unguess.schema.createTable(
      "wp_ug_campaign_read_status",
      function (table) {
        table.increments("id").notNullable();
        table.integer("unguess_wp_user_id").notNullable();
        table.integer("campaign_id").notNullable();
        table.integer("is_read").notNullable();
        table.timestamp("read_on").notNullable().defaultTo(unguess.fn.now());
        table
          .timestamp("last_read_on")
          .notNullable()
          .defaultTo(unguess.fn.now());
        table.unique(["campaign_id", "unguess_wp_user_id"]);
      }
    );
  }
  public drop() {
    return unguess.schema.dropTable("wp_ug_campaign_read_status");
  }
}

const item = new Table();

export default item;
