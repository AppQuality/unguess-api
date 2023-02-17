import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_campaign_type");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_campaign_type", function (table) {
      table.increments("id").notNullable();
      table.string("name");
      table.string("description");
      table.integer("has_auto_apply").defaultTo(0);
      table.string("icon");
      table.integer("type").defaultTo(0);
      table.integer("category_id").notNullable();
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_campaign_type");
  }
}

const item = new Table();

export default item;
