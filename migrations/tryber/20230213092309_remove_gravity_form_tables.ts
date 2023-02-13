import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("wp_gf_draft_submissions");
  await knex.schema.dropTableIfExists("wp_gf_entry");
  await knex.schema.dropTableIfExists("wp_gf_entry_meta");
  await knex.schema.dropTableIfExists("wp_gf_entry_notes");
  await knex.schema.dropTableIfExists("wp_gf_form");
  await knex.schema.dropTableIfExists("wp_gf_form_meta");
  await knex.schema.dropTableIfExists("wp_gf_form_revisions");
  await knex.schema.dropTableIfExists("wp_gf_form_view");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("wp_gf_draft_submissions", function (table) {
    table.string("uuid").notNullable();
    table.string("email");
    table.integer("form_id").notNullable();
    table.string("date_created").notNullable();
    table.string("ip").notNullable();
    table.string("source_url").notNullable();
    table.string("submission").notNullable();
  });
  await knex.schema.createTable("wp_gf_entry", function (table) {
    table.increments("id").notNullable();
    table.integer("form_id").notNullable();
    table.integer("post_id");
    table.string("date_created").notNullable();
    table.string("date_updated");
    table.integer("is_starred").notNullable().defaultTo(0);
    table.integer("is_read").notNullable().defaultTo(0);
    table.string("ip").notNullable();
    table.string("source_url").notNullable().defaultTo("");
    table.string("user_agent").notNullable().defaultTo("");
    table.string("currency");
    table.string("payment_status");
    table.string("payment_date");
    table.integer("payment_amount");
    table.string("payment_method");
    table.string("transaction_id");
    table.integer("is_fulfilled");
    table.integer("created_by");
    table.integer("transaction_type");
    table.string("status").notNullable().defaultTo("active");
  });

  await knex.schema.createTable("wp_gf_entry_meta", function (table) {
    table.increments("id").notNullable();
    table.integer("form_id").notNullable().defaultTo(0);
    table.integer("entry_id").notNullable();
    table.string("meta_key");
    table.string("meta_value");
    table.string("item_index");
  });

  await knex.schema.createTable("wp_gf_entry_notes", function (table) {
    table.increments("id").notNullable();
    table.integer("entry_id").notNullable();
    table.string("user_name");
    table.integer("user_id");
    table.string("date_created").notNullable();
    table.string("value");
    table.string("note_type");
    table.string("sub_type");
  });

  await knex.schema.createTable("wp_gf_form", function (table) {
    table.increments("id").notNullable();
    table.string("title").notNullable();
    table.string("date_created").notNullable();
    table.string("date_updated");
    table.integer("is_active").notNullable().defaultTo(1);
    table.integer("is_trash").notNullable().defaultTo(0);
  });

  await knex.schema.createTable("wp_gf_form_meta", function (table) {
    table.integer("form_id").notNullable();
    table.string("display_meta");
    table.string("entries_grid_meta");
    table.string("confirmations");
    table.string("notifications");
  });

  await knex.schema.createTable("wp_gf_form_revisions", function (table) {
    table.increments("id").notNullable();
    table.integer("form_id").notNullable();
    table.string("display_meta");
    table.string("date_created").notNullable();
  });

  await knex.schema.createTable("wp_gf_form_view", function (table) {
    table.increments("id").notNullable();
    table.integer("form_id").notNullable();
    table.string("date_created").notNullable();
    table.string("ip");
    table.integer("count").notNullable().defaultTo(1);
  });
}
