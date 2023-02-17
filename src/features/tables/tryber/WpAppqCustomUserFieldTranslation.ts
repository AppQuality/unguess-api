import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_custom_user_field_translation");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_custom_user_field_translation",
      function (table) {
        table.increments("id").notNullable();
        table.integer("field_id").notNullable();
        table.string("name").notNullable();
        table.string("placeholder").notNullable();
        table.string("lang").notNullable();
        table.unique(["id", "lang"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_custom_user_field_translation");
  }
}

const item = new Table();

export default item;
