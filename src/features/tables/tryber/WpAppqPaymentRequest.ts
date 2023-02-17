import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_payment_request");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_payment_request",
      function (table) {
        table.increments("id").notNullable();
        table.integer("tester_id").notNullable().defaultTo(-1);
        table.string("fiscal_id");
        table.string("address_street");
        table.string("address_city");
        table.string("address_country");
        table.string("paypal_email");
        table.string("bank_email");
        table.string("iban");
        table.string("bank");
        table.integer("amount").notNullable().defaultTo(0.0);
        table.integer("amount_paypal_fee").notNullable().defaultTo(0.0);
        table.integer("amount_withholding").notNullable().defaultTo(0.0);
        table.integer("amount_gross").notNullable().defaultTo(0.0);
        table.integer("is_paid").notNullable().defaultTo(0);
        table
          .timestamp("request_date")
          .notNullable()
          .defaultTo(tryber.fn.now());
        table
          .timestamp("paid_date")
          .notNullable()
          .defaultTo("0000-00-00 00:00:00");
        table.integer("fiscal_italian_residence");
        table.integer("fiscal_category").defaultTo(1);
        table.integer("under_threshold").notNullable();
        table.integer("withholding_tax_percentage").notNullable();
        table.integer("stamp_required").defaultTo(0);
        table
          .timestamp("stamp_paid_date")
          .notNullable()
          .defaultTo("0000-00-00 00:00:00");
        table.integer("receipt_id").notNullable().defaultTo(-1);
        table.string("receipt_title");
        table.integer("fiscal_profile_id").notNullable().defaultTo(-1);
        table.timestamp("update_date").notNullable().defaultTo(tryber.fn.now());
        table.string("error_message");
        table.string("account_holder_name");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_payment_request");
  }
}

const item = new Table();

export default item;
