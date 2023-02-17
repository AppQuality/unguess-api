import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_paypal_transaction");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_paypal_transaction",
      function (table) {
        table.increments("id").notNullable();
        table.integer("request_id").notNullable();
        table.string("payout_batch_id");
        table.string("notes");
        table.timestamp("creation").notNullable().defaultTo(tryber.fn.now());
        table
          .timestamp("update")
          .notNullable()
          .defaultTo("0000-00-00 00:00:00");
        table.string("transaction_id");
        table.string("transaction_status");
        table.string("payout_item_id");
        table.string("time_processed");
        table.string("receiver");
        table.integer("amount_value");
        table.string("amount_currency");
        table.integer("fee_value");
        table.string("fee_currency");
        table.string("sender_item_id");
        table.string("email_subject");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_paypal_transaction");
  }
}

const item = new Table();

export default item;
