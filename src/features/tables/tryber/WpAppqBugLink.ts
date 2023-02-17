import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_bug_link");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_bug_link", function (table) {
      table.increments("id").notNullable();
      table.integer("bug_id").notNullable();
      table.integer("expiration").defaultTo(1);
      table.timestamp("creation_date").notNullable().defaultTo(tryber.fn.now());
      table.unique(["bug_id"]);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_bug_link");
  }
}

const item = new Table();

export default item;
