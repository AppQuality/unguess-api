import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_course_answer");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_course_answer", function (table) {
      table.increments("id").notNullable();
      table.integer("question_id").notNullable();
      table.string("option_name");
      table.datetime("completion_date");
      table.integer("is_correct").defaultTo(0);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_course_answer");
  }
}

const item = new Table();

export default item;
