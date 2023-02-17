import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_evd_bug_status");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_evd_bug_status",
      function (table) {
        table.increments("id").notNullable();
        table.string("name");
        table.string("description");
        table.string("icon");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_evd_bug_status");
  }
}

const item = new Table();

export default item;
