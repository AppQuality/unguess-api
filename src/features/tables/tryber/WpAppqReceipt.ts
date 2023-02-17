import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_receipt");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_receipt", function (table) {
      table.increments("id").notNullable();
      table.string("tester_personal_receipt_id");
      table.integer("tester_id").notNullable();
      table.integer("payment_id");
      table.string("url");
      table.timestamp("creation").notNullable().defaultTo(tryber.fn.now());
      table.timestamp("update").notNullable().defaultTo("0000-00-00 00:00:00");
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_receipt");
  }
}

const item = new Table();

export default item;
