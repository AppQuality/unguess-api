import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_custom_user_field_dependencies");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_custom_user_field_dependencies",
      function (table) {
        table.increments("id").notNullable();
        table.integer("custom_user_field_id").notNullable();
        table.integer("custom_user_field_dependency_id").notNullable();
        table.integer("custom_user_field_dependency_value").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_custom_user_field_dependencies");
  }
}

const item = new Table();

export default item;
