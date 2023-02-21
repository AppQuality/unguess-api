import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_wpmm_subscribers");
  }

  public create() {
    return tryber.schema.createTable("wp_wpmm_subscribers", function (table) {
      table.increments("id_subscriber").notNullable();
      table.string("email").notNullable();
      table.datetime("insert_date").notNullable();
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_wpmm_subscribers");
  }
}

const item = new Table();

export default item;
