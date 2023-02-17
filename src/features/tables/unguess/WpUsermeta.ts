import { unguess } from "@src/features/knex";

class Table {
  public do() {
    return unguess("wp_usermeta");
  }

  public create() {
    return unguess.schema.createTable("wp_usermeta", function (table) {
      table.increments("umeta_id").notNullable();
      table.integer("user_id").notNullable().defaultTo(0);
      table.string("meta_key");
      table.string("meta_value");
    });
  }
  public drop() {
    return unguess.schema.dropTable("wp_usermeta");
  }
}

const item = new Table();

export default item;
