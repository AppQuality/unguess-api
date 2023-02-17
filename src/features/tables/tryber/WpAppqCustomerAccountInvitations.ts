import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_customer_account_invitations");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_customer_account_invitations",
      function (table) {
        table.increments("id").notNullable();
        table.string("token").notNullable();
        table.string("status").notNullable();
        table.integer("tester_id").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_customer_account_invitations");
  }
}

const item = new Table();

export default item;
