import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_tester_jotform_submissions");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_tester_jotform_submissions",
      function (table) {
        table.increments("id").notNullable();
        table.string("form_id").notNullable();
        table.string("submission_id").notNullable();
        table.integer("tester_id").notNullable();
        table
          .timestamp("creation_date")
          .notNullable()
          .defaultTo(tryber.fn.now());
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_tester_jotform_submissions");
  }
}

const item = new Table();

export default item;
