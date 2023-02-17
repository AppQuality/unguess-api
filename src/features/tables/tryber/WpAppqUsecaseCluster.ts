import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_usecase_cluster");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_usecase_cluster",
      function (table) {
        table.increments("id").notNullable();
        table.integer("campaign_id").notNullable();
        table.string("title").notNullable();
        table.string("subtitle").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_usecase_cluster");
  }
}

const item = new Table();

export default item;
