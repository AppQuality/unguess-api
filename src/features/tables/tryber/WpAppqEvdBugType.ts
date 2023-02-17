import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_evd_bug_type");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_evd_bug_type", function (table) {
      table.increments("id").notNullable();
      table.string("name");
      table.string("description");
      table.integer("is_enabled").defaultTo(1);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_evd_bug_type");
  }
}

const item = new Table();

export default item;
