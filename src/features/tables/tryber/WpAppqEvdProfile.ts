import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_evd_profile");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_evd_profile", function (table) {
      table.increments("id").notNullable();
      table.integer("wp_user_id").notNullable();
      table.string("name");
      table.string("surname");
      table.string("email").notNullable();
      table.integer("sex").notNullable().defaultTo(-1);
      table.datetime("birth_date");
      table.string("phone_number");
      table.string("city");
      table.string("address");
      table.integer("postal_code");
      table.string("province");
      table.string("country");
      table.integer("booty").notNullable().defaultTo(0.0);
      table.integer("payment_status").notNullable().defaultTo(0);
      table.integer("pending_booty").notNullable().defaultTo(0.0);
      table.integer("address_number");
      table.string("u2b_login_token");
      table.timestamp("creation_time").notNullable().defaultTo(tryber.fn.now());
      table.string("fb_login_token");
      table.timestamp("last_login");
      table.integer("total_exp_pts").notNullable().defaultTo(0);
      table.integer("is_verified").notNullable().defaultTo(0);
      table.string("ln_login_token");
      table.integer("entry_test").notNullable().defaultTo(0);
      table.datetime("entry_test_date");
      table.integer("employment_id").notNullable();
      table.integer("education_id").notNullable();
      table.string("state");
      table.string("country_code");
      table.integer("is_special").notNullable().defaultTo(0);
      table.timestamp("last_modified").notNullable().defaultTo(tryber.fn.now());
      table.string("fb_leads_form_id");
      table.timestamp("deletion_date");
      table.timestamp("last_activity");
      table.integer("blacklisted").defaultTo(0);
      table.integer("onboarding_complete").notNullable().defaultTo(0);
      table.unique(["wp_user_id"]);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_evd_profile");
  }
}

const item = new Table();

export default item;
