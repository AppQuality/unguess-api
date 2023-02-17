import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_popups");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_popups", function (table) {
      table.increments("id").notNullable();
      table.string("title");
      table.string("content");
      table.integer("is_once");
      table.string("targets");
      table.string("extras");
      table.integer("is_auto").notNullable().defaultTo(0);
      table.timestamp("created_at").notNullable().defaultTo(tryber.fn.now());
      table.timestamp("updated_at").notNullable().defaultTo(tryber.fn.now());
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_popups");
  }
}

const item = new Table();

export default item;
