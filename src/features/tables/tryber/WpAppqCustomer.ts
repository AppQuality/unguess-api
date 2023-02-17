import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_customer");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_customer", function (table) {
      table.increments("id").notNullable();
      table.string("company");
      table.string("country");
      table.integer("timezone_utc").defaultTo(1);
      table.string("language_code").defaultTo("it-IT");
      table.string("company_logo");
      table.string("email").notNullable();
      table.string("phone_number").notNullable();
      table.integer("pm_id");
      table.integer("use_company_logo").notNullable().defaultTo(0);
      table.integer("tokens").notNullable().defaultTo(-1);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_customer");
  }
}

const item = new Table();

export default item;
