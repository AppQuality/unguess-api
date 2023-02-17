import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_user_to_customer");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_user_to_customer",
      function (table) {
        table.integer("wp_user_id").notNullable();
        table.integer("customer_id").notNullable();
        table.unique(["wp_user_id", "customer_id"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_user_to_customer");
  }
}

const item = new Table();

export default item;
