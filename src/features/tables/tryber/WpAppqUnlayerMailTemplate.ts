import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_unlayer_mail_template");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_unlayer_mail_template",
      function (table) {
        table.increments("id").notNullable();
        table.string("name").notNullable();
        table.string("html_body").notNullable();
        table.string("json_body").notNullable();
        table.timestamp("creation_time").defaultTo(tryber.fn.now());
        table
          .timestamp("last_modified")
          .notNullable()
          .defaultTo(tryber.fn.now());
        table.integer("last_editor_tester_id").notNullable();
        table.string("lang").notNullable();
        table.integer("category_id").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_unlayer_mail_template");
  }
}

const item = new Table();

export default item;
