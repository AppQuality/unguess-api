import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_task_additional_data");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_task_additional_data",
      function (table) {
        table.increments("id").notNullable();
        table.integer("task_id").notNullable();
        table.integer("tester_id").notNullable();
        table.string("data_key").notNullable();
        table.string("data_value").notNullable();
        table.unique(["task_id", "data_key", "tester_id"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_task_additional_data");
  }
}

const item = new Table();

export default item;
