import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTable("wp_appq_bt_component");
  await knex.schema.dropTable("wp_appq_bt_field");
  await knex.schema.dropTable("wp_appq_bt_mapping");
  await knex.schema.dropTable("wp_appq_evd_apikey_credentials");
  await knex.schema.dropTable("wp_appq_evd_basic_credentials");
  await knex.schema.dropTable("wp_appq_evd_bitbucket_settings");
  await knex.schema.dropTable("wp_appq_evd_bitbucket_sync");
  await knex.schema.dropTable("wp_appq_evd_bugtracker_settings");
  await knex.schema.dropTable("wp_appq_evd_bugtracker_sync");
  await knex.schema.dropTable("wp_appq_evd_jira_settings");
  await knex.schema.dropTable("wp_appq_evd_jira_sync");
  await knex.schema.dropTable("wp_appq_evd_oauth1_credentials");
  await knex.schema.dropTable("wp_appq_evd_oauth2_credentials");
  await knex.schema.dropTable("wp_appq_evd_redmine_settings");
  await knex.schema.dropTable("wp_appq_evd_redmine_sync");
  await knex.schema.dropTable("wp_appq_evd_credentials");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("wp_appq_bt_component", function (table) {
    table.integer("cp_id").notNullable();
    table.string("component_name");
    table.string("component_key");
  });

  await knex.schema.createTable("wp_appq_bt_field", function (table) {
    table.integer("cp_id").notNullable();
    table.string("field_name");
    table.string("field_key");
    table.string("field_array_key");
    table.string("field_value_type");
    table.string("type");
    table.string("string_value");
    table.integer("mapping_id");
  });

  await knex.schema.createTable("wp_appq_bt_mapping", function (table) {
    table.increments("id").notNullable();
    table.integer("mapping_id").notNullable();
    table.integer("campaign_id");
    table.string("jira_field");
    table.string("out_value");
    table.string("in_value");
  });

  await knex.schema.createTable(
    "wp_appq_evd_apikey_credentials",
    function (table) {
      table.increments("id").notNullable();
      table.string("api_key").notNullable();
    }
  );

  await knex.schema.createTable(
    "wp_appq_evd_basic_credentials",
    function (table) {
      table.increments("id").notNullable();
      table.string("username").notNullable();
      table.string("password").notNullable();
    }
  );

  await knex.schema.createTable(
    "wp_appq_evd_bitbucket_settings",
    function (table) {
      table.increments("id").notNullable();
      table.string("auth_method");
    }
  );

  await knex.schema.createTable("wp_appq_evd_bitbucket_sync", function (table) {
    table.increments("id").notNullable();
    table.string("issue_key").notNullable();
  });

  await knex.schema.createTable(
    "wp_appq_evd_bugtracker_settings",
    function (table) {
      table.increments("id").notNullable();
      table.integer("campaign_id").notNullable();
      table.string("bug_tracker").notNullable();
      table.integer("settings_id").notNullable();
      table.integer("version_id").notNullable();
    }
  );

  await knex.schema.createTable(
    "wp_appq_evd_bugtracker_sync",
    function (table) {
      table.increments("id").notNullable();
      table.integer("bug_id").notNullable();
      table.string("bug_tracker").notNullable();
      table.integer("sync_id").notNullable();
    }
  );

  await knex.schema.createTable("wp_appq_evd_jira_settings", function (table) {
    table.increments("id").notNullable();
    table.string("auth_method");
    table.integer("custom_fields").defaultTo(1);
  });

  await knex.schema.createTable("wp_appq_evd_jira_sync", function (table) {
    table.increments("id").notNullable();
    table.string("issue_key").notNullable();
  });

  await knex.schema.createTable(
    "wp_appq_evd_oauth1_credentials",
    function (table) {
      table.increments("id").notNullable();
      table.string("consumer_key").notNullable();
      table.string("private_key").notNullable();
    }
  );

  await knex.schema.createTable(
    "wp_appq_evd_oauth2_credentials",
    function (table) {
      table.increments("id").notNullable();
      table.string("client_id").notNullable();
      table.string("consumer_key").notNullable();
    }
  );

  await knex.schema.createTable(
    "wp_appq_evd_redmine_settings",
    function (table) {
      table.increments("id").notNullable();
      table.string("auth_method");
      table.integer("custom_fields").defaultTo(1);
    }
  );

  await knex.schema.createTable("wp_appq_evd_redmine_sync", function (table) {
    table.increments("id").notNullable();
    table.string("issue_key").notNullable();
  });

  await knex.schema.createTable("wp_appq_evd_credentials", function (table) {
    table.increments("id").notNullable();
    table.integer("campaign_id").notNullable();
    table.string("auth_method").notNullable();
    table.string("base_url");
    table.string("project_key").notNullable();
    table.string("bug_tracker").notNullable();
    table.integer("credentials_id").notNullable();
    table.integer("version_id").notNullable();
  });
}
