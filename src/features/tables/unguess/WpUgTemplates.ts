import { unguess } from "@src/features/knex";

class Table {
  public do() {
    return unguess("wp_ug_templates");
  }

  public create() {
    return unguess.schema.createTable("wp_ug_templates", function (table) {
      table.increments("id").notNullable();
      table.string("title").notNullable();
      table.string("description");
      table.string("content");
      table.integer("category_id").notNullable();
      table.string("device_type").notNullable();
      table.string("image");
      table.string("locale").notNullable().defaultTo("en");
      table.integer("requires_login").notNullable().defaultTo(0);
      table.timestamp("created_on").notNullable().defaultTo(unguess.fn.now());
    });
  }
  public drop() {
    return unguess.schema.dropTable("wp_ug_templates");
  }
}

const item = new Table();

export default item;
