import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_campaign_classification_class");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_campaign_classification_class",
      function (table) {
        table.string("name").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_campaign_classification_class");
  }
}

const item = new Table();

export default item;
