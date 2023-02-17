import { unguess } from "@src/features/knex";

class Table {
  public do() {
    return unguess("wp_ug_features");
  }

  public create() {
    return unguess.schema.createTable("wp_ug_features", function (table) {
      table.increments("id").notNullable();
      table.string("slug").notNullable();
      table.string("display_name").notNullable();
    });
  }
  public drop() {
    return unguess.schema.dropTable("wp_ug_features");
  }
}

const item = new Table();

export default item;
