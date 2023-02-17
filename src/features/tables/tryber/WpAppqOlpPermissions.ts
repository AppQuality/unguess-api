import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_olp_permissions");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_olp_permissions",
      function (table) {
        table.integer("main_id").notNullable();
        table.string("main_type").notNullable();
        table.string("type").notNullable();
        table.integer("wp_user_id").notNullable();
        table.unique(["main_id", "wp_user_id", "type"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_olp_permissions");
  }
}

const item = new Table();

export default item;
