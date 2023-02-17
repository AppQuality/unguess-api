import { unguess } from "@src/features/knex";

class Table {
  public do() {
    return unguess("wp_commentmeta");
  }

  public create() {
    return unguess.schema.createTable("wp_commentmeta", function (table) {
      table.increments("meta_id").notNullable();
      table.integer("comment_id").notNullable().defaultTo(0);
      table.string("meta_key");
      table.string("meta_value");
    });
  }
  public drop() {
    return unguess.schema.dropTable("wp_commentmeta");
  }
}

const item = new Table();

export default item;
