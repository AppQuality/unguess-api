import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_lc_access");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_lc_access", function (table) {
      table.increments("id").notNullable();
      table.integer("tester_id");
      table.integer("view_id");
      table.integer("edited_by");
      table.timestamp("last_edit").notNullable().defaultTo(tryber.fn.now());
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_lc_access");
  }
}

const item = new Table();

export default item;
