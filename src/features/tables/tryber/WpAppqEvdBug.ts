import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_evd_bug");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_evd_bug", function (table) {
      table.increments("id").notNullable();
      table.string("internal_id");
      table.integer("wp_user_id").notNullable();
      table.string("message");
      table.string("description");
      table.string("expected_result");
      table.string("current_result");
      table.integer("campaign_id");
      table.integer("status_id");
      table.integer("publish").defaultTo(1);
      table.string("status_reason");
      table.integer("severity_id").defaultTo(1);
      table.datetime("created");
      table.datetime("updated");
      table.integer("bug_replicability_id");
      table.integer("bug_type_id");
      table.string("last_seen");
      table.string("application_section");
      table.string("note");
      table.integer("dev_id");
      table.string("manufacturer");
      table.string("model");
      table.string("os");
      table.string("os_version");
      table.string("last_seen_date");
      table.string("last_seen_time");
      table.integer("reviewer").notNullable();
      table.integer("is_perfect").defaultTo(1);
      table.integer("last_editor_id").notNullable();
      table.integer("last_editor_is_tester").notNullable().defaultTo(0);
      table.integer("is_duplicated").defaultTo(0);
      table.integer("duplicated_of_id");
      table.integer("is_favorite").defaultTo(0);
      table.integer("application_section_id").defaultTo(-1);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_evd_bug");
  }
}

const item = new Table();

export default item;
