import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTable("wp_aiowps_events");
  await knex.schema.dropTable("wp_aiowps_failed_logins");
  await knex.schema.dropTable("wp_aiowps_global_meta");
  await knex.schema.dropTable("wp_aiowps_login_activity");
  await knex.schema.dropTable("wp_aiowps_login_lockdown");
  await knex.schema.dropTable("wp_aiowps_permanent_block");
  return;
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("wp_aiowps_events", function (table) {
    table.increments("id");
    table.string("event_type");
    table.string("username");
    table.integer("user_id");
    table.string("event_date");
    table.string("ip_or_host");
    table.string("referer_info");
    table.string("url");
    table.string("country_code");
    table.string("event_data");
  });

  await knex.schema.createTable("wp_aiowps_failed_logins", function (table) {
    table.increments("id").notNullable();
    table.integer("user_id").notNullable();
    table.string("user_login").notNullable();
    table.string("failed_login_date").notNullable();
    table.string("login_attempt_ip").notNullable();
  });

  await knex.schema.createTable("wp_aiowps_global_meta", function (table) {
    table.increments("meta_id").notNullable();
    table.string("date_time").notNullable();
    table.string("meta_key1").notNullable();
    table.string("meta_key2").notNullable();
    table.string("meta_key3").notNullable();
    table.string("meta_key4").notNullable();
    table.string("meta_key5").notNullable();
    table.string("meta_value1").notNullable();
    table.string("meta_value2").notNullable();
    table.string("meta_value3").notNullable();
    table.string("meta_value4").notNullable();
    table.string("meta_value5").notNullable();
  });

  await knex.schema.createTable("wp_aiowps_login_activity", function (table) {
    table.increments("id").notNullable();
    table.integer("user_id").notNullable();
    table.string("user_login").notNullable();
    table.string("login_date").notNullable();
    table.string("logout_date").notNullable();
    table.string("login_ip").notNullable();
    table.string("login_country").notNullable();
    table.string("browser_type").notNullable();
  });

  await knex.schema.createTable("wp_aiowps_login_lockdown", function (table) {
    table.increments("id").notNullable();
    table.integer("user_id").notNullable();
    table.string("user_login").notNullable();
    table.string("lockdown_date").notNullable();
    table.string("release_date").notNullable();
    table.string("failed_login_ip").notNullable();
    table.string("lock_reason").notNullable();
    table.string("unlock_key").notNullable();
  });

  await knex.schema.createTable("wp_aiowps_permanent_block", function (table) {
    table.increments("id").notNullable();
    table.string("blocked_ip").notNullable();
    table.string("block_reason").notNullable();
    table.string("country_origin").notNullable();
    table.string("blocked_date").notNullable();
    table.integer("unblock").notNullable();
  });
  return;
}
