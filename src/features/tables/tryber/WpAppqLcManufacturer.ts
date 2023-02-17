import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_lc_manufacturer");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_lc_manufacturer",
      function (table) {
        table.increments("table_id").notNullable();
        table.string("id").notNullable();
        table.string("text").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_lc_manufacturer");
  }
}

const item = new Table();

export default item;
