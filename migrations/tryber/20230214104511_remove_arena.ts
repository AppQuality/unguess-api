import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTable("wp_appq_arena_app");
  await knex.schema.dropTable("wp_appq_arena_version");
  await knex.schema.table(
    "wp_appq_additional_bug_replicabilities",
    function (table) {
      table.dropColumn("version_id");
    }
  );
  await knex.schema.table(
    "wp_appq_additional_bug_severities",
    function (table) {
      table.dropColumn("version_id");
    }
  );
  await knex.schema.table("wp_appq_additional_bug_types", function (table) {
    table.dropColumn("version_id");
  });
  await knex.schema.table("wp_appq_contracts", function (table) {
    table.dropColumn("version_id");
  });
  await knex.schema.table("wp_appq_evd_bug", function (table) {
    table.dropColumn("version_id");
  });
  await knex.schema.table("wp_appq_evd_bug_rev", function (table) {
    table.dropColumn("version_id");
  });
  await knex.schema.table("wp_appq_exp_points", function (table) {
    table.dropColumn("version_id");
  });
  await knex.schema.table("wp_appq_payment", function (table) {
    table.dropColumn("version_id");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("wp_appq_arena_app", function (table) {
    table.increments("id").notNullable();
    table.string("name").notNullable();
    table.string("customer").notNullable();
    table.string("description");
    table.integer("is_active").notNullable().defaultTo(0);
    table.integer("is_published_on_bug_arena").notNullable().defaultTo(0);
    table.string("app_logo");
    table.string("content_info");
    table.integer("id_creator");
    table.integer("id_modifier");
    table.timestamp("created_on").notNullable().defaultTo(knex.fn.now());
    table.timestamp("last_edit").notNullable().defaultTo(knex.fn.now());
    table.integer("visibility_type").defaultTo(-1);
    table.string("approved_tester");
    table.integer("customer_id").notNullable();
    table.integer("pm_id").notNullable();
    table.integer("project_id").notNullable();
    table.string("customer_title").notNullable();
  });
  await knex.schema.createTable("wp_appq_arena_version", function (table) {
    table.increments("id").notNullable();
    table.string("bundle_id").notNullable();
    table.string("name").notNullable();
    table.string("code").notNullable();
    table.integer("platform_id").notNullable();
    table.string("out_of_scope");
    table.string("whats_new");
    table.integer("is_published_on_bug_arena").notNullable().defaultTo(0);
    table.integer("app_id").notNullable();
    table.integer("id_creator");
    table.integer("id_modifier");
    table.string("pricing");
    table.integer("is_active").notNullable().defaultTo(0);
    table.string("applink");
    table.timestamp("created_on").notNullable().defaultTo(knex.fn.now());
    table.timestamp("last_edit").notNullable().defaultTo(knex.fn.now());
    table.integer("campaign_pts").notNullable().defaultTo(200);
    table.integer("visibility_type").defaultTo(-1);
    table.string("approved_tester");
    table.integer("min_allowed_media").notNullable().defaultTo(3);
    table.string("additional_info");
    table.integer("is_website").notNullable().defaultTo(0);
  });
}
