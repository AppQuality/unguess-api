import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_cd_test_results");
  }

  public create() {
    return tryber.schema.createTable("wp_cd_test_results", function (table) {
      table.increments("id").notNullable();
      table.timestamp("creation_time").notNullable().defaultTo(tryber.fn.now());
      table.string("secs").notNullable();
      table.string("response").notNullable();
      table.integer("success");
      table.integer("question_id").notNullable();
      table.integer("tester_id").notNullable();
      table.integer("seconds");
      table.integer("errors");
      table.string("errors_details");
      table.integer("version").defaultTo(0);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_cd_test_results");
  }
}

const item = new Table();

export default item;
