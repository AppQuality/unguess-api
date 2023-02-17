import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_integration_center_integrations");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_integration_center_integrations",
      function (table) {
        table.increments("integration_id").notNullable();
        table.string("integration_slug").notNullable();
        table.string("integration_name").notNullable();
        table.integer("visible_to_customer").defaultTo(1);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_integration_center_integrations");
  }
}

const item = new Table();

export default item;
