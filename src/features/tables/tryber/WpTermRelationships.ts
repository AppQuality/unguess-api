import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_term_relationships");
  }

  public create() {
    return tryber.schema.createTable("wp_term_relationships", function (table) {
      table.integer("object_id").notNullable().defaultTo(0);
      table.integer("term_taxonomy_id").notNullable().defaultTo(0);
      table.integer("term_order").notNullable().defaultTo(0);
      table.unique(["object_id", "term_taxonomy_id"]);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_term_relationships");
  }
}

const item = new Table();

export default item;
