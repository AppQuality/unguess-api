import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_integration_center_bugs");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_integration_center_bugs",
      function (table) {
        table.integer("bug_id").notNullable();
        table.string("integration").notNullable().defaultTo("");
        table.timestamp("upload_date").defaultTo(tryber.fn.now());
        table.string("bugtracker_id");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_integration_center_bugs");
  }
}

const item = new Table();

export default item;
