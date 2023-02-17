import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_evd_campaign_rev");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_evd_campaign_rev",
      function (table) {
        table.increments("id").notNullable();
        table.integer("campaign_id").notNullable().defaultTo(-1);
        table.integer("platform_id").notNullable();
        table.string("start_date").notNullable();
        table.string("end_date").notNullable();
        table.string("close_date");
        table.string("title").notNullable();
        table.string("customer_title").notNullable();
        table.string("description");
        table.integer("desired_number_of_testers").defaultTo(20);
        table.integer("platform_version");
        table.string("os").defaultTo(0);
        table.string("form_factor").defaultTo(0);
        table.string("base_bug_internal_id");
        table.integer("number_of_test_case");
        table.integer("status_id").defaultTo(1);
        table.integer("is_public").defaultTo(0);
        table.string("manual_link");
        table.string("preview_link");
        table.integer("page_preview_id").notNullable();
        table.integer("page_manual_id").notNullable();
        table.integer("min_allowed_media").notNullable().defaultTo(3);
        table.integer("campaign_type").defaultTo(0);
        table.integer("campaign_type_id").defaultTo(0);
        table.integer("campaign_pts").notNullable().defaultTo(200);
        table.integer("project_id").notNullable();
        table.integer("pm_id").notNullable();
        table.string("custom_link");
        table.integer("screen_on_every_step").notNullable().defaultTo(0);
        table.string("tb_link");
        table
          .timestamp("triggered_on")
          .notNullable()
          .defaultTo(tryber.fn.now());
        table.integer("cust_bug_vis").notNullable().defaultTo(0);
        table.integer("bug_lang").defaultTo(0);
        table.integer("aq_index").notNullable().defaultTo(1);
        table.string("class");
        table.string("family");
        table.string("status_details");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_evd_campaign_rev");
  }
}

const item = new Table();

export default item;
