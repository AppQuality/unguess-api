import { unguess } from "@src/features/knex";

class Table {
  public do() {
    return unguess("wp_links");
  }

  public create() {
    return unguess.schema.createTable("wp_links", function (table) {
      table.increments("link_id").notNullable();
      table.string("link_url").notNullable().defaultTo("");
      table.string("link_name").notNullable().defaultTo("");
      table.string("link_image").notNullable().defaultTo("");
      table.string("link_target").notNullable().defaultTo("");
      table.string("link_description").notNullable().defaultTo("");
      table.string("link_visible").notNullable().defaultTo("Y");
      table.integer("link_owner").notNullable().defaultTo(1);
      table.integer("link_rating").notNullable().defaultTo(0);
      table
        .datetime("link_updated")
        .notNullable()
        .defaultTo("0000-00-00 00:00:00");
      table.string("link_rel").notNullable().defaultTo("");
      table.string("link_notes").notNullable();
      table.string("link_rss").notNullable().defaultTo("");
    });
  }
  public drop() {
    return unguess.schema.dropTable("wp_links");
  }
}

const item = new Table();

export default item;
