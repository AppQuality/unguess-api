import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_comments");
  }

  public create() {
    return tryber.schema.createTable("wp_comments", function (table) {
      table.increments("comment_ID").notNullable();
      table.integer("comment_post_ID").notNullable().defaultTo(0);
      table.string("comment_author").notNullable();
      table.string("comment_author_email").notNullable().defaultTo("");
      table.string("comment_author_url").notNullable().defaultTo("");
      table.string("comment_author_IP").notNullable().defaultTo("");
      table
        .datetime("comment_date")
        .notNullable()
        .defaultTo("0000-00-00 00:00:00");
      table
        .datetime("comment_date_gmt")
        .notNullable()
        .defaultTo("0000-00-00 00:00:00");
      table.string("comment_content").notNullable();
      table.integer("comment_karma").notNullable().defaultTo(0);
      table.string("comment_approved").notNullable().defaultTo(1);
      table.string("comment_agent").notNullable().defaultTo("");
      table.string("comment_type").notNullable().defaultTo("comment");
      table.integer("comment_parent").notNullable().defaultTo(0);
      table.integer("user_id").notNullable().defaultTo(0);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_comments");
  }
}

const item = new Table();

export default item;
