import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_custom_user_field_groups");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_custom_user_field_groups",
      function (table) {
        table.increments("id").notNullable();
        table.string("name").notNullable();
        table.string("description").notNullable();
        table.integer("priority").notNullable().defaultTo(0);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_custom_user_field_groups");
  }
}

const item = new Table();

export default item;
