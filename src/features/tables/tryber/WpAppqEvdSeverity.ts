import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_evd_severity");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_evd_severity", function (table) {
      table.increments("id").notNullable();
      table.string("name");
      table.string("description");
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_evd_severity");
  }
}

const item = new Table();

export default item;
