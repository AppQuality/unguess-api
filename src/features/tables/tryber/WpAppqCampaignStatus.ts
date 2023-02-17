import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_campaign_status");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_campaign_status",
      function (table) {
        table.increments("id").notNullable();
        table.string("display_name");
        table.string("description");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_campaign_status");
  }
}

const item = new Table();

export default item;
