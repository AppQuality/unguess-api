import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_paypal_bulk_transaction");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_paypal_bulk_transaction",
      function (table) {
        table.increments("id").notNullable();
        table.string("payout_batch_id");
        table.integer("operator_id");
        table.string("creation_time");
        table.string("completed_time");
        table.string("status");
        table.integer("amount_value");
        table.string("amount_currency");
        table.integer("fee_value");
        table.string("fee_currency");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_paypal_bulk_transaction");
  }
}

const item = new Table();

export default item;
