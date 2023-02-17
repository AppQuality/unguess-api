import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_payment");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_payment", function (table) {
      table.increments("id").notNullable();
      table.integer("tester_id");
      table.integer("campaign_id");
      table.string("work_type");
      table.string("note");
      table.integer("amount").notNullable().defaultTo(0.0);
      table.integer("is_requested").notNullable().defaultTo(0);
      table.integer("request_id").notNullable().defaultTo(0);
      table.timestamp("creation_date").notNullable().defaultTo(tryber.fn.now());
      table.integer("is_paid").notNullable().defaultTo(0);
      table.integer("receipt_id").notNullable().defaultTo(-1);
      table.string("receipt_title");
      table.integer("created_by");
      table.integer("work_type_id").defaultTo(1);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_payment");
  }
}

const item = new Table();

export default item;
