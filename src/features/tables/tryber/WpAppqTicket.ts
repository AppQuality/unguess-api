import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_ticket");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_ticket", function (table) {
      table.increments("id").notNullable();
      table.integer("bug_id").notNullable().defaultTo(-1);
      table.timestamp("creation_date").notNullable().defaultTo(tryber.fn.now());
      table.timestamp("update_date").notNullable().defaultTo(tryber.fn.now());
      table.string("causal");
      table.integer("pm_id").notNullable().defaultTo(-1);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_ticket");
  }
}

const item = new Table();

export default item;
