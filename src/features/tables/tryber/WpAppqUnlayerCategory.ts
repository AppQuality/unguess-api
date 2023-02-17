import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_unlayer_category");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_unlayer_category",
      function (table) {
        table.increments("id").notNullable();
        table.string("name").notNullable();
        table.string("description");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_unlayer_category");
  }
}

const item = new Table();

export default item;
