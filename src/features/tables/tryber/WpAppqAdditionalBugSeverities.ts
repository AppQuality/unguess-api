import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_additional_bug_severities");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_additional_bug_severities",
      function (table) {
        table.increments("id").notNullable();
        table.integer("campaign_id").notNullable().defaultTo(-1);
        table.integer("bug_severity_id").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_additional_bug_severities");
  }
}

const item = new Table();

export default item;
