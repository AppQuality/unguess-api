import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_campaign_classification_status");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_campaign_classification_status",
      function (table) {
        table.string("name").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_campaign_classification_status");
  }
}

const item = new Table();

export default item;
