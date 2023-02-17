import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_payment_tw_recipient");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_payment_tw_recipient",
      function (table) {
        table.increments("id").notNullable();
        table.integer("tester_id").notNullable();
        table.string("currency").notNullable().defaultTo("");
        table.string("country");
        table.string("type");
        table.string("legal_type");
        table.integer("tw_account_id");
        table.string("created_time").defaultTo(tryber.fn.now());
        table.string("modification_time");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_payment_tw_recipient");
  }
}

const item = new Table();

export default item;
