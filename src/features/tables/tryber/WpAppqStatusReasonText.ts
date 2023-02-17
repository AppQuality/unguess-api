import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_status_reason_text");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_status_reason_text",
      function (table) {
        table.increments("id").notNullable();
        table.string("display_name").notNullable().defaultTo(-1);
        table.string("content");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_status_reason_text");
  }
}

const item = new Table();

export default item;
