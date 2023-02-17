import { unguess } from "@src/features/knex";

class Table {
  public do() {
    return unguess("wp_ug_express");
  }

  public create() {
    return unguess.schema.createTable("wp_ug_express", function (table) {
      table.increments("id").notNullable();
      table.string("slug").notNullable();
      table.integer("cost").notNullable().defaultTo(0.0);
    });
  }
  public drop() {
    return unguess.schema.dropTable("wp_ug_express");
  }
}

const item = new Table();

export default item;
