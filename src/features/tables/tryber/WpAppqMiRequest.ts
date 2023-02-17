import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_mi_request");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_mi_request", function (table) {
      table.increments("id").notNullable();
      table.integer("bug_id").notNullable();
      table.integer("cp_id").notNullable();
      table.string("request").notNullable();
      table.integer("wp_user_id").notNullable();
      table.timestamp("creation").notNullable().defaultTo(tryber.fn.now());
      table.timestamp("expiration");
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_mi_request");
  }
}

const item = new Table();

export default item;
