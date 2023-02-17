import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_evd_bug_media");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_evd_bug_media", function (table) {
      table.increments("id").notNullable();
      table.string("type");
      table.string("title");
      table.string("description");
      table.string("location");
      table.integer("bug_id").notNullable();
      table.string("uploaded");
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_evd_bug_media");
  }
}

const item = new Table();

export default item;
