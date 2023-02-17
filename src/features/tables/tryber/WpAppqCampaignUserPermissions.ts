import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_campaign_user_permissions");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_campaign_user_permissions",
      function (table) {
        table.integer("tester_id").notNullable();
        table.integer("cp_id").notNullable();
        table.integer("cap_read").notNullable().defaultTo(0);
        table.integer("cap_write").notNullable().defaultTo(0);
        table.integer("cap_review").notNullable().defaultTo(0);
        table.unique(["cp_id", "tester_id"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_campaign_user_permissions");
  }
}

const item = new Table();

export default item;
