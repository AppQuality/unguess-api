import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_course_tester_certification");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_course_tester_certification",
      function (table) {
        table.integer("tester_id").notNullable();
        table.integer("course_id").notNullable();
        table.string("cert_id").notNullable();
        table.string("location").notNullable();
        table
          .timestamp("creation_date")
          .notNullable()
          .defaultTo(tryber.fn.now());
        table.unique(["tester_id", "course_id"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_course_tester_certification");
  }
}

const item = new Table();

export default item;
