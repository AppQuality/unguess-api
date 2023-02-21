import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_evd_campaign");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_evd_campaign", function (table) {
      table.increments("id").notNullable();
      table.integer("platform_id").notNullable();
      table.datetime("start_date").notNullable();
      table.datetime("end_date").notNullable();
      table.datetime("close_date");
      table.string("title").notNullable();
      table.string("description");
      table.integer("desired_number_of_testers").defaultTo(20);
      table.string("customer");
      table.integer("platform_version");
      table.string("test_fairy_project");
      table.string("test_fairy_build");
      table.string("jot_form_prj");
      table.string("base_bug_internal_id");
      table.integer("number_of_test_case");
      table.integer("status_id").defaultTo(1);
      table.integer("is_public").defaultTo(0);
      table.string("manual_link");
      table.string("preview_link");
      table.integer("page_preview_id").notNullable();
      table.integer("page_manual_id").notNullable();
      table.integer("campaign_type").defaultTo(0);
      table.string("os").defaultTo(0);
      table.string("form_factor").defaultTo(0);
      table.integer("low_bug_pts").notNullable().defaultTo(0);
      table.integer("medium_bug_pts").notNullable().defaultTo(0);
      table.integer("high_bug_pts").notNullable().defaultTo(0);
      table.integer("critical_bug_pts").notNullable().defaultTo(0);
      table.integer("campaign_pts").notNullable().defaultTo(200);
      table.integer("customer_id").notNullable();
      table.integer("pm_id").notNullable();
      table.string("custom_link");
      table.integer("min_allowed_media").notNullable().defaultTo(3);
      table.integer("campaign_type_id").defaultTo(0);
      table.integer("project_id").notNullable();
      table.string("customer_title").notNullable();
      table.integer("screen_on_every_step").notNullable().defaultTo(0);
      table.string("tb_link");
      table.integer("cust_bug_vis").notNullable().defaultTo(0);
      table.integer("bug_lang").defaultTo(0);
      table.integer("aq_index").notNullable().defaultTo(1);
      table.integer("effort");
      table.integer("tokens_usage");
      table.integer("ux_effort");
      table.string("class");
      table.string("family");
      table.string("status_details");
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_evd_campaign");
  }
}

const item = new Table();

export default item;
