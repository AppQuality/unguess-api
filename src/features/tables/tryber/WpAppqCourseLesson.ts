import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_course_lesson");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_course_lesson", function (table) {
      table.increments("id").notNullable();
      table.integer("course_id").notNullable();
      table.string("lesson_name").notNullable();
      table.string("content").notNullable();
      table.integer("post_id");
      table.integer("priority").notNullable().defaultTo(0);
      table.integer("is_quiz").notNullable().defaultTo(1);
      table.integer("quiz_question_number").notNullable().defaultTo(1);
      table.integer("quiz_question_target").notNullable().defaultTo(0);
      table.string("failed_content").notNullable();
      table.unique(["id", "course_id"]);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_course_lesson");
  }
}

const item = new Table();

export default item;
