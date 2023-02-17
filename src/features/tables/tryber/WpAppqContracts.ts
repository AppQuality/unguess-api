import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_contracts");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_contracts", function (table) {
      table.increments("id").notNullable();
      table.integer("tester_id").notNullable();
      table.integer("campaign_id");
      table.string("url");
      table.timestamp("creation").notNullable().defaultTo(tryber.fn.now());
      table.timestamp("update").notNullable().defaultTo("0000-00-00 00:00:00");
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_contracts");
  }
}

const item = new Table();

export default item;
