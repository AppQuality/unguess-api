import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_popups_read_status");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_popups_read_status",
      function (table) {
        table.integer("tester_id").notNullable();
        table.integer("popup_id").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_popups_read_status");
  }
}

const item = new Table();

export default item;
