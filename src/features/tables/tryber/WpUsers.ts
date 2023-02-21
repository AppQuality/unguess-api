import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_users");
  }

  public create() {
    return tryber.schema.createTable("wp_users", function (table) {
      table.increments("ID").notNullable();
      table.string("user_login").notNullable().defaultTo("");
      table.string("user_pass").notNullable().defaultTo("");
      table.string("user_nicename").notNullable().defaultTo("");
      table.string("user_email").notNullable().defaultTo("");
      table.string("user_url").notNullable().defaultTo("");
      table
        .datetime("user_registered")
        .notNullable()
        .defaultTo("0000-00-00 00:00:00");
      table.string("user_activation_key").notNullable().defaultTo("");
      table.integer("user_status").notNullable().defaultTo(0);
      table.string("display_name").notNullable().defaultTo("");
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_users");
  }
}

const item = new Table();

export default item;
