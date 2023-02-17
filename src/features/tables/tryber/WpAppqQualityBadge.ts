import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_quality_badge");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_quality_badge", function (table) {
      table.increments("id").notNullable();
      table.integer("customer_id").notNullable();
      table.string("size");
      table.string("theme");
      table.string("token").notNullable();
      table.string("public_content").notNullable();
      table.integer("is_active").notNullable().defaultTo(1);
      table.integer("created_by").notNullable();
      table.timestamp("creation_date").notNullable().defaultTo(tryber.fn.now());
      table.unique(["token"]);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_quality_badge");
  }
}

const item = new Table();

export default item;
