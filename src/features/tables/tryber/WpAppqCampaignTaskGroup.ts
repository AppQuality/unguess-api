import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_campaign_task_group");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_campaign_task_group",
      function (table) {
        table.integer("task_id").notNullable();
        table.integer("group_id").notNullable().defaultTo(0);
        table.unique(["task_id", "group_id"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_campaign_task_group");
  }
}

const item = new Table();

export default item;
