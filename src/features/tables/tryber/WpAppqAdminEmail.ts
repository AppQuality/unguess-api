import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_admin_email");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_admin_email", function (table) {
      table.increments("id").notNullable();
      table.integer("tester_id").notNullable().defaultTo(-1);
      table.integer("dem_id").notNullable().defaultTo(-1);
      table.timestamp("creation_date").notNullable().defaultTo(tryber.fn.now());
      table.integer("is_read").defaultTo(0);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_admin_email");
  }
}

const item = new Table();

export default item;
