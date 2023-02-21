import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_custom_user_field");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_custom_user_field",
      function (table) {
        table.increments("id").notNullable();
        table.string("slug").notNullable();
        table.string("name").notNullable();
        table.string("placeholder").notNullable();
        table.string("type").defaultTo("text");
        table.string("extras").notNullable();
        table.integer("can_be_null").notNullable().defaultTo(0);
        table.integer("priority").notNullable().defaultTo(0);
        table.integer("allow_other").notNullable().defaultTo(1);
        table.integer("enabled").notNullable().defaultTo(0);
        table.integer("custom_user_field_group_id").notNullable();
        table.datetime("created_time").defaultTo(tryber.fn.now());
        table.string("options");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_custom_user_field");
  }
}

const item = new Table();

export default item;
