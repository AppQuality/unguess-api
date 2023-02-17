import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_dc_appq_api_keys");
  }

  public create() {
    return tryber.schema.createTable("wp_dc_appq_api_keys", function (table) {
      table.increments("id").notNullable();
      table.string("api_name").notNullable();
      table.string("prefix").notNullable();
      table.string("key_hashed").notNullable();
      table.integer("author_user_id").notNullable();
      table.timestamp("creation_date").defaultTo(tryber.fn.now());
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_dc_appq_api_keys");
  }
}

const item = new Table();

export default item;
