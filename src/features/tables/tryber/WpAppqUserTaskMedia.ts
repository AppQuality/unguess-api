import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_user_task_media");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_user_task_media",
      function (table) {
        table.increments("id").notNullable();
        table.integer("campaign_task_id").notNullable();
        table.integer("user_task_id").notNullable();
        table.integer("tester_id").notNullable();
        table.string("filename").defaultTo("");
        table.integer("size").notNullable().defaultTo(0);
        table.string("location").notNullable();
        table
          .timestamp("creation_date")
          .notNullable()
          .defaultTo(tryber.fn.now());
        table.integer("status").notNullable().defaultTo(0);
        table.integer("favorite").defaultTo(0);
        table.string("manufacturer");
        table.string("model");
        table.string("pc_type");
        table.integer("platform_id");
        table.integer("os_version_id");
        table.string("form_factor");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_user_task_media");
  }
}

const item = new Table();

export default item;
