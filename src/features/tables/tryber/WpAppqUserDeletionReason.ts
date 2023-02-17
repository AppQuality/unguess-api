import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_user_deletion_reason");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_user_deletion_reason",
      function (table) {
        table.integer("tester_id");
        table.string("reason");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_user_deletion_reason");
  }
}

const item = new Table();

export default item;
