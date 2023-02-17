import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_event");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_event", function (table) {
      table.increments("id").notNullable();
      table.string("category");
      table.string("description");
      table.timestamp("create").defaultTo(tryber.fn.now());
      table.timestamp("done");
      table.timestamp("modified").defaultTo(tryber.fn.now());
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_event");
  }
}

const item = new Table();

export default item;
