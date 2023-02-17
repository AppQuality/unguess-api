import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_course_tester_answer");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_course_tester_answer",
      function (table) {
        table.increments("id").notNullable();
        table.integer("lesson_id").notNullable();
        table.integer("answer_id").notNullable();
        table.integer("tester_id").notNullable();
        table.integer("is_correct").defaultTo(0);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_course_tester_answer");
  }
}

const item = new Table();

export default item;
