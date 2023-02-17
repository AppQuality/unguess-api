import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_payment_tw_quote");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_payment_tw_quote",
      function (table) {
        table.increments("id").notNullable();
        table.integer("transaction_id").notNullable();
        table.string("source_currency").notNullable().defaultTo("");
        table.string("target_currency").notNullable().defaultTo("");
        table.integer("source_amount");
        table.integer("target_amount");
        table.string("type");
        table.string("created_time").defaultTo(tryber.fn.now());
        table.string("modification_time");
        table.integer("created_by_user_id");
        table.integer("operator_id");
        table.string("rate");
        table.string("delivery_estimate");
        table.integer("fee");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_payment_tw_quote");
  }
}

const item = new Table();

export default item;
