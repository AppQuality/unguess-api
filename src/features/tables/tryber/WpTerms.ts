import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_terms");
  }

  public create() {
    return tryber.schema.createTable("wp_terms", function (table) {
      table.increments("term_id").notNullable();
      table.string("name").notNullable().defaultTo("");
      table.string("slug").notNullable().defaultTo("");
      table.integer("term_group").notNullable().defaultTo(0);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_terms");
  }
}

const item = new Table();

export default item;
