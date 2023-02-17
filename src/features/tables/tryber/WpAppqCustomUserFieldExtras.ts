import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_custom_user_field_extras");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_custom_user_field_extras",
      function (table) {
        table.increments("id").notNullable();
        table.integer("custom_user_field_id").notNullable();
        table.string("name").notNullable();
        table.integer("order").notNullable().defaultTo(0);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_custom_user_field_extras");
  }
}

const item = new Table();

export default item;
