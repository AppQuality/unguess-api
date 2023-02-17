import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_status_reason_usage");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_status_reason_usage",
      function (table) {
        table.increments("id").notNullable();
        table.integer("message_id").notNullable();
        table.integer("bug_id").notNullable();
        table.integer("pm_id").notNullable();
        table
          .timestamp("creation_date")
          .notNullable()
          .defaultTo(tryber.fn.now());
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_status_reason_usage");
  }
}

const item = new Table();

export default item;
