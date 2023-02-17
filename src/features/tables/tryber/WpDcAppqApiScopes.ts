import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_dc_appq_api_scopes");
  }

  public create() {
    return tryber.schema.createTable("wp_dc_appq_api_scopes", function (table) {
      table.increments("id").notNullable();
      table.string("display_name").notNullable();
      table.timestamp("creation_date").defaultTo(tryber.fn.now());
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_dc_appq_api_scopes");
  }
}

const item = new Table();

export default item;
