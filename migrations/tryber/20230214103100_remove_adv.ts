import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTable("wp_appq_adv_campaign_country");
  await knex.schema.dropTable("wp_appq_adv_campaign_cta");
  await knex.schema.dropTable("wp_appq_adv_campaign_language");
  await knex.schema.dropTable("wp_appq_adv_campaign_level");
  await knex.schema.dropTable("wp_appq_adv_campaign_result");
  await knex.schema.dropTable("wp_appq_adv_campaign_rule");
  await knex.schema.dropTable("wp_appq_adv_disclaimer");
  await knex.schema.dropTable("wp_appq_adv_fields_position");
  await knex.schema.dropTable("wp_appq_adv_options");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable(
    "wp_appq_adv_campaign_country",
    function (table) {
      table.increments("id").notNullable();
      table.string("name");
      table.string("code");
      table.string("sign");
    }
  );

  await knex.schema.createTable("wp_appq_adv_campaign_cta", function (table) {
    table.increments("id").notNullable();
    table.string("code");
    table.string("dtm_cta");
    table.string("cta_behaviour");
    table.string("master_key");
    table.string("master_key_it");
  });

  await knex.schema.createTable(
    "wp_appq_adv_campaign_language",
    function (table) {
      table.increments("id").notNullable();
      table.string("name");
      table.string("code");
    }
  );

  await knex.schema.createTable("wp_appq_adv_campaign_level", function (table) {
    table.increments("id").notNullable();
    table.string("level1");
    table.string("level2");
    table.string("level3");
    table.string("level4");
    table.string("assetId");
    table.string("source");
  });

  await knex.schema.createTable(
    "wp_appq_adv_campaign_result",
    function (table) {
      table.integer("rule_id").notNullable().defaultTo(0);
      table.integer("cp_id").notNullable().defaultTo(0);
      table.boolean("lead_hash").notNullable().defaultTo(0);
      table.string("lead");
      table.integer("status_id");
      table.timestamp("creation").notNullable().defaultTo(knex.fn.now());
      table.timestamp("update").notNullable().defaultTo("0000-00-00 00:00:00");
      table.integer("pm_id");
      table.string("note");
      table.unique(["cp_id", "rule_id", "lead_hash"]);
    }
  );

  await knex.schema.createTable("wp_appq_adv_campaign_rule", function (table) {
    table.increments("id").notNullable();
    table.string("mk_field");
    table.string("co_field");
    table.string("validation_type");
    table.string("validation");
    table.string("co_activation_field");
    table.string("co_activation_value");
    table.integer("value_if_error");
    table.timestamp("creation").notNullable().defaultTo(knex.fn.now());
    table.timestamp("update").notNullable().defaultTo("0000-00-00 00:00:00");
    table.string("note");
    table.integer("can_autoclose").defaultTo(0);
  });

  await knex.schema.createTable("wp_appq_adv_disclaimer", function (table) {
    table.increments("id").notNullable();
    table.string("country");
    table.string("language");
    table.integer("disclaimer");
  });

  await knex.schema.createTable(
    "wp_appq_adv_fields_position",
    function (table) {
      table.string("field_name").notNullable().defaultTo("");
      table.integer("position").notNullable();
      table.unique(["field_name", "position"]);
    }
  );

  await knex.schema.createTable("wp_appq_adv_options", function (table) {
    table.string("email").notNullable();
    table.integer("prj_id").notNullable().defaultTo(0);
    table.string("email_cc").notNullable();
    table.integer("pm_id").notNullable().defaultTo(32);
    table.unique(["prj_id", "email"]);
  });
}
