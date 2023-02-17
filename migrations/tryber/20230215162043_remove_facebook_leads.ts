import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTable("wp_appq_facebook_leads_ads");
  await knex.schema.dropTable("wp_appq_facebook_leads_import");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("wp_appq_facebook_leads_ads", function (table) {
    table.increments("id").notNullable();
    table.integer("ads_id").notNullable();
    table.string("ad_title").notNullable();
    table.string("fb_status").notNullable();
    table.string("fb_creation").notNullable();
    table.integer("auto_signup").notNullable().defaultTo(0);
    table.string("cron_period").notNullable().defaultTo("manual");
    table.unique(["ads_id"]);
  });
  await knex.schema.createTable(
    "wp_appq_facebook_leads_import",
    function (table) {
      table.increments("id").notNullable();
      table.integer("form_id").notNullable();
      table.string("creation_date").notNullable();
    }
  );
}
