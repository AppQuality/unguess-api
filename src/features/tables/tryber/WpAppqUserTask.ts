import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_user_task");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_user_task", function (table) {
      table.increments("id").notNullable();
      table.integer("tester_id").notNullable().defaultTo(-1);
      table.integer("task_id").notNullable();
      table.integer("is_completed").notNullable();
      table.timestamp("creation_date").notNullable().defaultTo(tryber.fn.now());
      table.unique(["tester_id", "task_id"]);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_user_task");
  }
}

const item = new Table();

export default item;
