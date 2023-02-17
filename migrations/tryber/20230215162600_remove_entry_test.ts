import { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.dropTable("wp_appq_entry_test_quiz");
  await knex.schema.dropTable("wp_appq_entry_test_responses_rev");
  await knex.schema.dropTable("wp_appq_entry_test_responses");
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.createTable("wp_appq_entry_test_quiz", function (table) {
    table.increments("id").notNullable();
    table.integer("campaign_id").notNullable().defaultTo(0);
    table.string("title");
    table.string("description");
    table.string("expected");
    table.string("actual");
    table.string("available_types");
    table.string("available_severities");
    table.string("accepted_t");
    table.string("accepted_s");
    table.string("media_link");
    table.unique(["id", "campaign_id"]);
  });
  await knex.schema.createTable(
    "wp_appq_entry_test_responses_rev",
    function (table) {
      table.increments("id").notNullable();
      table.integer("question_id").notNullable().defaultTo(0);
      table.integer("tester_id").notNullable().defaultTo(0);
      table.integer("selected_t").notNullable().defaultTo(0);
      table.integer("selected_s").notNullable().defaultTo(0);
      table.timestamp("creation_date").notNullable().defaultTo(knex.fn.now());
      table.timestamp("update_date").notNullable().defaultTo(knex.fn.now());
    }
  );
  await knex.schema.createTable(
    "wp_appq_entry_test_responses",
    function (table) {
      table.increments("id").notNullable();
      table.integer("question_id").notNullable().defaultTo(0);
      table.integer("tester_id").notNullable().defaultTo(0);
      table.integer("selected_t").notNullable().defaultTo(0);
      table.integer("selected_s").notNullable().defaultTo(0);
      table.timestamp("creation_date").notNullable().defaultTo(knex.fn.now());
      table
        .timestamp("update_date")
        .notNullable()
        .defaultTo("0000-00-00 00:00:00");
      table.unique(["tester_id", "question_id"]);
    }
  );
}
