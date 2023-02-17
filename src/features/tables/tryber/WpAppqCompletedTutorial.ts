import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_completed_tutorial");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_completed_tutorial",
      function (table) {
        table.increments("tester_id").notNullable();
        table.string("tutorial").notNullable();
        table
          .timestamp("completion_date")
          .notNullable()
          .defaultTo(tryber.fn.now());
        table.unique(["tutorial", "tester_id"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_completed_tutorial");
  }
}

const item = new Table();

export default item;
