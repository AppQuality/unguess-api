import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_evd_platform");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_evd_platform", function (table) {
      table.increments("id").notNullable();
      table.string("name");
      table.integer("form_factor").notNullable().defaultTo(0);
      table.integer("architecture").notNullable();
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_evd_platform");
  }
}

const item = new Table();

export default item;
