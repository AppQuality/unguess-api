import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_lc_network");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_lc_network", function (table) {
      table.integer("id").notNullable();
      table.string("text").notNullable();
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_lc_network");
  }
}

const item = new Table();

export default item;
