import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_signups");
  }

  public create() {
    return tryber.schema.createTable("wp_signups", function (table) {
      table.increments("signup_id").notNullable();
      table.string("domain").notNullable().defaultTo("");
      table.string("path").notNullable().defaultTo("");
      table.string("title").notNullable();
      table.string("user_login").notNullable().defaultTo("");
      table.string("user_email").notNullable().defaultTo("");
      table.string("registered").notNullable().defaultTo("0000-00-00 00:00:00");
      table.string("activated").notNullable().defaultTo("0000-00-00 00:00:00");
      table.integer("active").notNullable().defaultTo(0);
      table.string("activation_key").notNullable().defaultTo("");
      table.string("meta");
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_signups");
  }
}

const item = new Table();

export default item;
