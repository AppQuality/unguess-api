import { unguess } from "@src/features/knex";

class Table {
  public do() {
    return unguess("wp_ug_coins");
  }

  public create() {
    return unguess.schema.createTable("wp_ug_coins", function (table) {
      table.increments("id").notNullable();
      table.integer("customer_id").notNullable();
      table.integer("amount").notNullable().defaultTo(0);
      table.integer("initial_amount").defaultTo(0);
      table.integer("agreement_id");
      table.integer("price").notNullable().defaultTo(0.0);
      table.timestamp("created_on").notNullable().defaultTo(unguess.fn.now());
      table.timestamp("updated_on").notNullable().defaultTo(unguess.fn.now());
      table.string("notes");
    });
  }
  public drop() {
    return unguess.schema.dropTable("wp_ug_coins");
  }
}

const item = new Table();

export default item;
