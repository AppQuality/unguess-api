import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_cd_test_question");
  }

  public create() {
    return tryber.schema.createTable("wp_cd_test_question", function (table) {
      table.increments("id").notNullable();
      table
        .datetime("creation_time")
        .notNullable()
        .defaultTo("0000-00-00 00:00:01");
      table
        .datetime("update_time")
        .notNullable()
        .defaultTo("0000-00-00 00:00:01");
      table.string("title").notNullable();
      table.string("question").notNullable();
      table.string("answer").notNullable();
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_cd_test_question");
  }
}

const item = new Table();

export default item;
