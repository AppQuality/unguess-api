import { unguess } from "@src/features/knex";

class Table {
  public do() {
    return unguess("wp_term_relationships");
  }

  public create() {
    return unguess.schema.createTable(
      "wp_term_relationships",
      function (table) {
        table.integer("object_id").notNullable().defaultTo(0);
        table.integer("term_taxonomy_id").notNullable().defaultTo(0);
        table.integer("term_order").notNullable().defaultTo(0);
        table.unique(["object_id", "term_taxonomy_id"]);
      }
    );
  }
  public drop() {
    return unguess.schema.dropTable("wp_term_relationships");
  }
}

const item = new Table();

export default item;
