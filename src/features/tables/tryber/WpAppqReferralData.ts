import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_referral_data");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_referral_data", function (table) {
      table.increments("id").notNullable();
      table.integer("campaign_id").notNullable();
      table.integer("tester_id").notNullable();
      table.integer("referrer_id").notNullable();
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_referral_data");
  }
}

const item = new Table();

export default item;
