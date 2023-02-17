import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_course_tester_answer_rev");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_course_tester_answer_rev",
      function (table) {
        table.increments("id").notNullable();
        table.integer("lesson_id").notNullable();
        table.integer("answer_id").notNullable();
        table.integer("tester_id").notNullable();
        table.integer("is_correct").defaultTo(0);
        table.timestamp("answer_time").notNullable().defaultTo(tryber.fn.now());
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_course_tester_answer_rev");
  }
}

const item = new Table();

export default item;
