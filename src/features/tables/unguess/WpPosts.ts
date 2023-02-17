import { unguess } from "@src/features/knex";

class Table {
  public do() {
    return unguess("wp_posts");
  }

  public create() {
    return unguess.schema.createTable("wp_posts", function (table) {
      table.increments("ID").notNullable();
      table.integer("post_author").notNullable().defaultTo(0);
      table.string("post_date").notNullable().defaultTo("0000-00-00 00:00:00");
      table
        .string("post_date_gmt")
        .notNullable()
        .defaultTo("0000-00-00 00:00:00");
      table.string("post_content").notNullable();
      table.string("post_title").notNullable();
      table.string("post_excerpt").notNullable();
      table.string("post_status").notNullable().defaultTo("publish");
      table.string("comment_status").notNullable().defaultTo("open");
      table.string("ping_status").notNullable().defaultTo("open");
      table.string("post_password").notNullable().defaultTo("");
      table.string("post_name").notNullable().defaultTo("");
      table.string("to_ping").notNullable();
      table.string("pinged").notNullable();
      table
        .string("post_modified")
        .notNullable()
        .defaultTo("0000-00-00 00:00:00");
      table
        .string("post_modified_gmt")
        .notNullable()
        .defaultTo("0000-00-00 00:00:00");
      table.string("post_content_filtered").notNullable();
      table.integer("post_parent").notNullable().defaultTo(0);
      table.string("guid").notNullable().defaultTo("");
      table.integer("menu_order").notNullable().defaultTo(0);
      table.string("post_type").notNullable().defaultTo("post");
      table.string("post_mime_type").notNullable().defaultTo("");
      table.integer("comment_count").notNullable().defaultTo(0);
    });
  }
  public drop() {
    return unguess.schema.dropTable("wp_posts");
  }
}

const item = new Table();

export default item;
