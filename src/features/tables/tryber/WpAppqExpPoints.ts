import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_exp_points");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_exp_points", function (table) {
      table.increments("id").notNullable();
      table.integer("tester_id").notNullable();
      table.integer("campaign_id").notNullable();
      table.integer("activity_id").notNullable();
      table.string("reason").notNullable();
      table.integer("pm_id").notNullable();
      table.timestamp("creation_date").notNullable().defaultTo(tryber.fn.now());
      table.integer("amount").notNullable().defaultTo(0);
      table.integer("bug_id").notNullable().defaultTo(-1);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_exp_points");
  }
}

const item = new Table();

export default item;
