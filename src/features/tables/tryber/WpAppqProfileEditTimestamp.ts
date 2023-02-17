import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_profile_edit_timestamp");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_profile_edit_timestamp",
      function (table) {
        table.integer("tester_id").notNullable();
        table.string("table_name");
        table
          .timestamp("creation_date")
          .notNullable()
          .defaultTo(tryber.fn.now());
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_profile_edit_timestamp");
  }
}

const item = new Table();

export default item;
