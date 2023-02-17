import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_course_tester_status");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_course_tester_status",
      function (table) {
        table.integer("tester_id").notNullable();
        table.integer("course_id").notNullable();
        table.string("start_date");
        table.string("completion_date");
        table.integer("is_completed").notNullable().defaultTo(0);
        table.integer("last_lesson_id").notNullable().defaultTo(0);
        table.unique(["tester_id", "course_id"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_course_tester_status");
  }
}

const item = new Table();

export default item;
