import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_dc_appq_accepted_properties");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_dc_appq_accepted_properties",
      function (table) {
        table.increments("id").notNullable();
        table.string("internal_name").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_dc_appq_accepted_properties");
  }
}

const item = new Table();

export default item;
