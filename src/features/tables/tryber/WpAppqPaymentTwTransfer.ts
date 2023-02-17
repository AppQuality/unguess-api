import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_payment_tw_transfer");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_payment_tw_transfer",
      function (table) {
        table.increments("id").notNullable();
        table.integer("tw_account").notNullable();
        table.integer("quote_id").notNullable();
        table.string("customer_transaction_id");
        table.string("status");
        table.string("reference");
        table.timestamp("created");
        table.string("has_active_issues");
        table.string("source_currency");
        table.integer("source_amount");
        table.string("target_currency");
        table.integer("target_amount");
        table.string("type");
        table.string("error_code");
        table.string("created_time").defaultTo(tryber.fn.now());
        table.string("modification_time");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_payment_tw_transfer");
  }
}

const item = new Table();

export default item;
