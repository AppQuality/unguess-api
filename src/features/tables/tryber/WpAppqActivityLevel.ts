import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_activity_level");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_activity_level",
      function (table) {
        table.increments("id").notNullable();
        table.integer("tester_id").notNullable();
        table.integer("level_id").notNullable();
        table.datetime("start_date").notNullable().defaultTo(tryber.fn.now());
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_activity_level");
  }
}

const item = new Table();

export default item;
