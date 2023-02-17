import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_term_taxonomy");
  }

  public create() {
    return tryber.schema.createTable("wp_term_taxonomy", function (table) {
      table.increments("term_taxonomy_id").notNullable();
      table.integer("term_id").notNullable().defaultTo(0);
      table.string("taxonomy").notNullable().defaultTo("");
      table.string("description").notNullable();
      table.integer("parent").notNullable().defaultTo(0);
      table.integer("count").notNullable().defaultTo(0);
      table.unique(["taxonomy", "term_id"]);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_term_taxonomy");
  }
}

const item = new Table();

export default item;
