import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_additional_bug_replicabilities");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_additional_bug_replicabilities",
      function (table) {
        table.increments("id").notNullable();
        table.integer("campaign_id").notNullable().defaultTo(-1);
        table.integer("bug_replicability_id").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_additional_bug_replicabilities");
  }
}

const item = new Table();

export default item;
