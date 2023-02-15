import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTable("wp_yoast_indexable_hierarchy");
  await knex.schema.dropTable("wp_yoast_indexable");
  await knex.schema.dropTable("wp_yoast_migrations");
  await knex.schema.dropTable("wp_yoast_primary_term");
  await knex.schema.dropTable("wp_yoast_seo_links");
  await knex.schema.dropTable("wp_yoast_seo_meta");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable(
    "wp_yoast_indexable_hierarchy",
    function (table) {
      table.integer("indexable_id").notNullable().defaultTo(0);
      table.integer("ancestor_id").notNullable().defaultTo(0);
      table.integer("depth");
      table.integer("blog_id").notNullable().defaultTo(1);
      table.unique(["ancestor_id", "indexable_id"]);
    }
  );
  await knex.schema.createTable("wp_yoast_indexable", function (table) {
    table.increments("id").notNullable();
    table.string("permalink");
    table.string("permalink_hash");
    table.integer("object_id");
    table.string("object_type").notNullable();
    table.string("object_sub_type");
    table.integer("author_id");
    table.integer("post_parent");
    table.string("title");
    table.string("description");
    table.string("breadcrumb_title");
    table.string("post_status");
    table.integer("is_public");
    table.integer("is_protected").defaultTo(0);
    table.integer("has_public_posts");
    table.integer("number_of_pages");
    table.string("canonical");
    table.string("primary_focus_keyword");
    table.integer("primary_focus_keyword_score");
    table.integer("readability_score");
    table.integer("is_cornerstone").defaultTo(0);
    table.integer("is_robots_noindex").defaultTo(0);
    table.integer("is_robots_nofollow").defaultTo(0);
    table.integer("is_robots_noarchive").defaultTo(0);
    table.integer("is_robots_noimageindex").defaultTo(0);
    table.integer("is_robots_nosnippet").defaultTo(0);
    table.string("twitter_title");
    table.string("twitter_image");
    table.string("twitter_description");
    table.string("twitter_image_id");
    table.string("twitter_image_source");
    table.string("open_graph_title");
    table.string("open_graph_description");
    table.string("open_graph_image");
    table.string("open_graph_image_id");
    table.string("open_graph_image_source");
    table.string("open_graph_image_meta");
    table.integer("link_count");
    table.integer("incoming_link_count");
    table.integer("prominent_words_version");
    table.string("created_at");
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.integer("blog_id").notNullable().defaultTo(1);
    table.string("language");
    table.string("region");
    table.string("schema_page_type");
    table.string("schema_article_type");
    table.integer("has_ancestors").defaultTo(0);
    table.integer("estimated_reading_time_minutes");
  });
  await knex.schema.createTable("wp_yoast_primary_term", function (table) {
    table.increments("id").notNullable();
    table.integer("post_id");
    table.integer("term_id");
    table.string("taxonomy").notNullable();
    table.string("created_at");
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    table.integer("blog_id").notNullable().defaultTo(1);
  });
  await knex.schema.createTable("wp_yoast_seo_meta", function (table) {
    table.integer("object_id").notNullable();
    table.integer("internal_link_count");
    table.integer("incoming_link_count");
    table.unique(["object_id"]);
  });

  await knex.schema.createTable("wp_yoast_migrations", function (table) {
    table.increments("id").notNullable();
    table.string("version");
    table.unique(["version"]);
  });

  await knex.schema.createTable("wp_yoast_seo_links", function (table) {
    table.increments("id").notNullable();
    table.string("url").notNullable();
    table.integer("post_id").notNullable();
    table.integer("target_post_id").notNullable();
    table.string("type").notNullable();
    table.integer("indexable_id");
    table.integer("target_indexable_id");
    table.integer("height");
    table.integer("width");
    table.integer("size");
    table.string("language");
    table.string("region");
  });
}
