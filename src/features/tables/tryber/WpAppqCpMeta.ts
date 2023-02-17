import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_cp_meta");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_cp_meta", function (table) {
      table.increments("meta_id").notNullable();
      table.integer("campaign_id").notNullable().defaultTo(0);
      table.string("meta_key");
      table.string("meta_value");
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_cp_meta");
  }
}

const item = new Table();

export default item;
