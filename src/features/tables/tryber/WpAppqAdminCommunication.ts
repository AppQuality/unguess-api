import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_admin_communication");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_admin_communication",
      function (table) {
        table.increments("id").notNullable();
        table.string("title");
        table.string("content");
        table.integer("success").notNullable().defaultTo(0);
        table.integer("fails").notNullable().defaultTo(0);
        table
          .timestamp("creation_date")
          .notNullable()
          .defaultTo(tryber.fn.now());
        table.integer("campaign_id").notNullable().defaultTo(-1);
        table.integer("pm_id").notNullable().defaultTo(-1);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_admin_communication");
  }
}

const item = new Table();

export default item;
