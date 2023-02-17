import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_project");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_project", function (table) {
      table.increments("id").notNullable();
      table.string("display_name").notNullable();
      table.integer("customer_id").notNullable();
      table.integer("edited_by").notNullable();
      table.timestamp("created_on").notNullable().defaultTo(tryber.fn.now());
      table.timestamp("last_edit").notNullable().defaultTo(tryber.fn.now());
      table.unique(["customer_id", "display_name"]);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_project");
  }
}

const item = new Table();

export default item;
