import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_bug_read_status");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_bug_read_status",
      function (table) {
        table.increments("id").notNullable();
        table.integer("wp_id").notNullable();
        table.integer("bug_id").notNullable();
        table.integer("is_read").notNullable().defaultTo(0);
        table.timestamp("read_on").notNullable().defaultTo(tryber.fn.now());
        table.unique(["wp_id", "bug_id"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_bug_read_status");
  }
}

const item = new Table();

export default item;
