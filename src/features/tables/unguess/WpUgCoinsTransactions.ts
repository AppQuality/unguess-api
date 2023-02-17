import { unguess } from "@src/features/knex";

class Table {
  public do() {
    return unguess("wp_ug_coins_transactions");
  }

  public create() {
    return unguess.schema.createTable(
      "wp_ug_coins_transactions",
      function (table) {
        table.increments("id").notNullable();
        table.integer("customer_id").notNullable();
        table.integer("profile_id").notNullable();
        table.integer("quantity").notNullable();
        table.integer("campaign_id").notNullable();
        table.integer("coins_package_id").notNullable();
        table.timestamp("created_on").notNullable().defaultTo(unguess.fn.now());
        table.string("notes");
      }
    );
  }
  public drop() {
    return unguess.schema.dropTable("wp_ug_coins_transactions");
  }
}

const item = new Table();

export default item;
