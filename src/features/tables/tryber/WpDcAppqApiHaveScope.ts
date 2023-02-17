import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_dc_appq_api_have_scope");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_dc_appq_api_have_scope",
      function (table) {
        table.increments("id").notNullable();
        table.integer("key_id").notNullable();
        table.integer("scope_id").notNullable();
        table.timestamp("creation_date").defaultTo(tryber.fn.now());
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_dc_appq_api_have_scope");
  }
}

const item = new Table();

export default item;
