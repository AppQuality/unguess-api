import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_payment_work_types");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_payment_work_types",
      function (table) {
        table.increments("id").notNullable();
        table.string("work_type").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_payment_work_types");
  }
}

const item = new Table();

export default item;
