import { unguess } from "@src/features/knex";

class Table {
  public do() {
    return unguess("wp_unguess_user_to_customer");
  }

  public create() {
    return unguess.schema.createTable(
      "wp_unguess_user_to_customer",
      function (table) {
        table.increments("id").notNullable();
        table.integer("unguess_wp_user_id").notNullable();
        table.integer("tryber_wp_user_id").notNullable();
        table.integer("profile_id").notNullable();
      }
    );
  }
  public drop() {
    return unguess.schema.dropTable("wp_unguess_user_to_customer");
  }
}

const item = new Table();

export default item;
