import { unguess } from "@src/features/knex";

class Table {
  public do() {
    return unguess("wp_appq_unique_bug_read");
  }

  public create() {
    return unguess.schema.createTable(
      "wp_appq_unique_bug_read",
      function (table) {
        table.integer("wp_user_id").notNullable();
        table.integer("campaign_id").notNullable();
        table.integer("bugs_read").notNullable();
        table.timestamp("update_time").notNullable();
      }
    );
  }
  public drop() {
    return unguess.schema.dropTable("wp_appq_unique_bug_read");
  }
}

const item = new Table();

export default item;
