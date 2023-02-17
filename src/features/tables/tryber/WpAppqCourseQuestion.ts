import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_course_question");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_course_question",
      function (table) {
        table.increments("id").notNullable();
        table.integer("course_id").notNullable();
        table.integer("lesson_id").notNullable();
        table.string("question");
        table.integer("priority").notNullable().defaultTo(0);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_course_question");
  }
}

const item = new Table();

export default item;
