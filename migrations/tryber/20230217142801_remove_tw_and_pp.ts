import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTable("wp_appq_payment_tw_quote");
  await knex.schema.dropTable("wp_appq_payment_tw_recipient");
  await knex.schema.dropTable("wp_appq_payment_tw_transfer");
  await knex.schema.dropTable("wp_appq_paypal_bulk_transaction");
  await knex.schema.dropTable("wp_appq_paypal_transaction");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("wp_appq_payment_tw_quote", function (table) {
    table.increments("id").notNullable();
    table.integer("transaction_id").notNullable();
    table.string("source_currency").notNullable().defaultTo("");
    table.string("target_currency").notNullable().defaultTo("");
    table.integer("source_amount");
    table.integer("target_amount");
    table.string("type");
    table.datetime("created_time").defaultTo(knex.fn.now());
    table.datetime("modification_time");
    table.integer("created_by_user_id");
    table.integer("operator_id");
    table.string("rate");
    table.datetime("delivery_estimate");
    table.integer("fee");
  });
  await knex.schema.createTable(
    "wp_appq_payment_tw_recipient",
    function (table) {
      table.increments("id").notNullable();
      table.integer("tester_id").notNullable();
      table.string("currency").notNullable().defaultTo("");
      table.string("country");
      table.string("type");
      table.string("legal_type");
      table.integer("tw_account_id");
      table.datetime("created_time").defaultTo(knex.fn.now());
      table.datetime("modification_time");
    }
  );
  await knex.schema.createTable(
    "wp_appq_payment_tw_transfer",
    function (table) {
      table.increments("id").notNullable();
      table.integer("tw_account").notNullable();
      table.integer("quote_id").notNullable();
      table.string("customer_transaction_id");
      table.string("status");
      table.string("reference");
      table.timestamp("created");
      table.string("has_active_issues");
      table.string("source_currency");
      table.integer("source_amount");
      table.string("target_currency");
      table.integer("target_amount");
      table.string("type");
      table.string("error_code");
      table.datetime("created_time").defaultTo(knex.fn.now());
      table.datetime("modification_time");
    }
  );
  await knex.schema.createTable(
    "wp_appq_paypal_bulk_transaction",
    function (table) {
      table.increments("id").notNullable();
      table.string("payout_batch_id");
      table.integer("operator_id");
      table.datetime("creation_time");
      table.datetime("completed_time");
      table.string("status");
      table.integer("amount_value");
      table.string("amount_currency");
      table.integer("fee_value");
      table.string("fee_currency");
    }
  );
  await knex.schema.createTable("wp_appq_paypal_transaction", function (table) {
    table.increments("id").notNullable();
    table.integer("request_id").notNullable();
    table.string("payout_batch_id");
    table.string("notes");
    table.timestamp("creation").notNullable().defaultTo(knex.fn.now());
    table.timestamp("update").notNullable().defaultTo("0000-00-00 00:00:00");
    table.string("transaction_id");
    table.string("transaction_status");
    table.string("payout_item_id");
    table.datetime("time_processed");
    table.string("receiver");
    table.integer("amount_value");
    table.string("amount_currency");
    table.integer("fee_value");
    table.string("fee_currency");
    table.string("sender_item_id");
    table.string("email_subject");
  });
}
