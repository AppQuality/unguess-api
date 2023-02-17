import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_activity_level_rev");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_activity_level_rev",
      function (table) {
        table.increments("id").notNullable();
        table.integer("tester_id").notNullable();
        table.integer("level_id").notNullable();
        table.string("start_date").notNullable();
        table.string("end_date").notNullable().defaultTo(tryber.fn.now());
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_activity_level_rev");
  }
}

const item = new Table();

export default item;
