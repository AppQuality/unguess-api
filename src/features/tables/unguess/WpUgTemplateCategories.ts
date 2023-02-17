import { unguess } from "@src/features/knex";

class Table {
  public do() {
    return unguess("wp_ug_template_categories");
  }

  public create() {
    return unguess.schema.createTable(
      "wp_ug_template_categories",
      function (table) {
        table.increments("id").notNullable();
        table.string("name").notNullable();
        table.timestamp("created_on").notNullable().defaultTo(unguess.fn.now());
      }
    );
  }
  public drop() {
    return unguess.schema.dropTable("wp_ug_template_categories");
  }
}

const item = new Table();

export default item;
