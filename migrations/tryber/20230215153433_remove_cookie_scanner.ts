import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTable("wp_cli_cookie_scan");
  await knex.schema.dropTable("wp_cli_cookie_scan_cookies");
  await knex.schema.dropTable("wp_cli_cookie_scan_url");
  await knex.schema.dropTable("wp_cli_scripts");
  await knex.schema.dropTable("wp_cli_cookie_scan_categories");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable(
    "wp_cli_cookie_scan_categories",
    function (table) {
      table.increments("id_cli_cookie_category").notNullable();
      table.string("cli_cookie_category_name").notNullable();
      table.string("cli_cookie_category_description");
      table.unique(["cli_cookie_category_name"]);
    }
  );
  await knex.schema.createTable("wp_cli_cookie_scan_cookies", function (table) {
    table.increments("id_cli_cookie_scan_cookies").notNullable();
    table.integer("id_cli_cookie_scan").notNullable().defaultTo(0);
    table.integer("id_cli_cookie_scan_url").notNullable().defaultTo(0);
    table.string("cookie_id").notNullable();
    table.string("expiry").notNullable();
    table.string("type").notNullable();
    table.string("category").notNullable();
    table.integer("category_id").notNullable();
    table.string("description");
  });
  await knex.schema.createTable("wp_cli_cookie_scan", function (table) {
    table.increments("id_cli_cookie_scan").notNullable();
    table.integer("status").notNullable().defaultTo(0);
    table.integer("created_at").notNullable().defaultTo(0);
    table.integer("total_url").notNullable().defaultTo(0);
    table.integer("total_cookies").notNullable().defaultTo(0);
    table.string("current_action").notNullable();
    table.integer("current_offset").notNullable().defaultTo(0);
  });
  await knex.schema.createTable("wp_cli_cookie_scan_url", function (table) {
    table.increments("id_cli_cookie_scan_url").notNullable();
    table.integer("id_cli_cookie_scan").notNullable().defaultTo(0);
    table.string("url").notNullable();
    table.integer("scanned").notNullable().defaultTo(0);
    table.integer("total_cookies").notNullable().defaultTo(0);
  });
  await knex.schema.createTable("wp_cli_scripts", function (table) {
    table.increments("id").notNullable();
    table.string("cliscript_title").notNullable();
    table.string("cliscript_category").notNullable();
    table.integer("cliscript_type").defaultTo(0);
    table.string("cliscript_status").notNullable();
    table.string("cliscript_description").notNullable();
    table.string("cliscript_key").notNullable();
    table.integer("type").notNullable().defaultTo(0);
  });
}
