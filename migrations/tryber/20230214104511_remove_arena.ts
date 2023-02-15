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

  await knex.raw("DROP TRIGGER IF EXISTS save_bug_history");
  await knex.raw(`
  CREATE TRIGGER save_bug_history
  BEFORE UPDATE
  ON wp_appq_evd_bug
  FOR EACH ROW
    if @disable_bug_trigger is null then
        INSERT INTO wp_appq_evd_bug_rev(bug_id, internal_id, wp_user_id, message, description, expected_result,
                                        current_result, campaign_id,  status_id, publish, status_reason,
                                        bug_replicability_id, bug_type_id, severity_id, last_seen, last_seen_date,
                                        last_seen_time, application_section, bug_creation_date, note, dev_id,
                                        manufacturer, model, os, os_version, reviewer, is_perfect, last_editor_id,
                                        last_editor_is_tester, is_duplicated, is_favorite, duplicated_of_id)
        VALUES (old.id, old.internal_id, old.wp_user_id, old.message, old.description, old.expected_result,
                old.current_result, old.campaign_id,  old.status_id, old.publish, old.status_reason,
                old.bug_replicability_id, old.bug_type_id, old.severity_id, old.last_seen, old.last_seen_date,
                old.last_seen_time, old.application_section, old.created, old.note, old.dev_id, old.manufacturer,
                old.model, old.os, old.os_version, old.reviewer, old.is_perfect, old.last_editor_id,
                old.last_editor_is_tester, old.is_duplicated, old.is_favorite, old.duplicated_of_id);
    end if;
  `);
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

  await knex.schema.table(
    "wp_appq_additional_bug_replicabilities",
    function (table) {
      table.integer("version_id");
    }
  );
  await knex.schema.table(
    "wp_appq_additional_bug_severities",
    function (table) {
      table.integer("version_id");
    }
  );
  await knex.schema.table("wp_appq_additional_bug_types", function (table) {
    table.integer("version_id");
  });
  await knex.schema.table("wp_appq_contracts", function (table) {
    table.integer("version_id");
  });
  await knex.schema.table("wp_appq_evd_bug", function (table) {
    table.integer("version_id");
  });
  await knex.schema.table("wp_appq_evd_bug_rev", function (table) {
    table.integer("version_id");
  });
  await knex.schema.table("wp_appq_exp_points", function (table) {
    table.integer("version_id");
  });
  await knex.schema.table("wp_appq_payment", function (table) {
    table.integer("version_id");
  });

  await knex.raw("DROP TRIGGER IF EXISTS save_bug_history");
  await knex.raw(`
  CREATE TRIGGER save_bug_history
  BEFORE UPDATE
  ON wp_appq_evd_bug
  FOR EACH ROW
    if @disable_bug_trigger is null then
        INSERT INTO wp_appq_evd_bug_rev(bug_id, internal_id, wp_user_id, message, description, expected_result,
                                        current_result, campaign_id, version_id, status_id, publish, status_reason,
                                        bug_replicability_id, bug_type_id, severity_id, last_seen, last_seen_date,
                                        last_seen_time, application_section, bug_creation_date, note, dev_id,
                                        manufacturer, model, os, os_version, reviewer, is_perfect, last_editor_id,
                                        last_editor_is_tester, is_duplicated, is_favorite, duplicated_of_id)
        VALUES (old.id, old.internal_id, old.wp_user_id, old.message, old.description, old.expected_result,
                old.current_result, old.campaign_id, old.version_id, old.status_id, old.publish, old.status_reason,
                old.bug_replicability_id, old.bug_type_id, old.severity_id, old.last_seen, old.last_seen_date,
                old.last_seen_time, old.application_section, old.created, old.note, old.dev_id, old.manufacturer,
                old.model, old.os, old.os_version, old.reviewer, old.is_perfect, old.last_editor_id,
                old.last_editor_is_tester, old.is_duplicated, old.is_favorite, old.duplicated_of_id);
    end if;
  `);
}
