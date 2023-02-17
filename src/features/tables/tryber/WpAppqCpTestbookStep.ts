import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_cp_testbook_step");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_cp_testbook_step",
      function (table) {
        table.integer("source_id").notNullable();
        table.integer("tester_id").notNullable();
        table.integer("step_id").notNullable();
        table.integer("status_id").notNullable();
        table.integer("bug_id");
        table.string("note").notNullable();
        table.string("media_link");
        table
          .timestamp("creation_date")
          .notNullable()
          .defaultTo(tryber.fn.now());
        table.unique(["tester_id", "source_id", "step_id"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_cp_testbook_step");
  }
}

const item = new Table();

export default item;
