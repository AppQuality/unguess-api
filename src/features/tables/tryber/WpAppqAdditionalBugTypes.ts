import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_additional_bug_types");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_additional_bug_types",
      function (table) {
        table.increments("id").notNullable();
        table.integer("campaign_id").notNullable().defaultTo(-1);
        table.integer("bug_type_id").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_additional_bug_types");
  }
}

const item = new Table();

export default item;
