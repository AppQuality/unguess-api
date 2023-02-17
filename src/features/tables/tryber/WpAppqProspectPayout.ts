import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_prospect_payout");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_prospect_payout",
      function (table) {
        table.increments("id").notNullable();
        table.integer("campaign_id").notNullable();
        table.integer("tester_id").notNullable();
        table.integer("complete_pts").notNullable();
        table.integer("extra_pts").notNullable();
        table.integer("complete_eur").notNullable();
        table.integer("bonus_bug_eur").notNullable();
        table.integer("extra_eur").notNullable();
        table.integer("refund").notNullable();
        table.string("notes").notNullable().defaultTo("");
        table.integer("is_edit").notNullable().defaultTo(0);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_prospect_payout");
  }
}

const item = new Table();

export default item;
