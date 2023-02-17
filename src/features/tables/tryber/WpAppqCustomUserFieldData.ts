import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_custom_user_field_data");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_custom_user_field_data",
      function (table) {
        table.increments("id").notNullable();
        table.integer("custom_user_field_id").notNullable();
        table.string("value").notNullable();
        table.integer("profile_id").notNullable();
        table.integer("candidate").notNullable();
        table.timestamp("last_update").defaultTo(tryber.fn.now());
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_custom_user_field_data");
  }
}

const item = new Table();

export default item;
