import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_lc_model");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_lc_model", function (table) {
      table.increments("id").notNullable();
      table.string("id_manufacturer").notNullable();
      table.string("name").notNullable();
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_lc_model");
  }
}

const item = new Table();

export default item;
