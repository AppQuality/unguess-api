import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_lc_view_meta");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_lc_view_meta", function (table) {
      table.increments("id").notNullable();
      table.integer("view_id").notNullable();
      table.integer("status_id");
      table.unique(["view_id", "view_id", "view_id", "view_id", "view_id"]);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_lc_view_meta");
  }
}

const item = new Table();

export default item;
