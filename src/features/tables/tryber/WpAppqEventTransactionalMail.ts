import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_event_transactional_mail");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_event_transactional_mail",
      function (table) {
        table.increments("id").notNullable();
        table.string("event_name").notNullable();
        table.string("event_description");
        table.integer("template_id").notNullable();
        table.string("dynamic_fields").notNullable().defaultTo("");
        table.timestamp("creation_time").defaultTo(tryber.fn.now());
        table
          .timestamp("last_modified")
          .notNullable()
          .defaultTo(tryber.fn.now());
        table.integer("last_editor_tester_id").notNullable();
        table.unique(["template_id", "template_id"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_event_transactional_mail");
  }
}

const item = new Table();

export default item;
