import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_employment");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_employment", function (table) {
      table.increments("id").notNullable();
      table.string("display_name").notNullable();
      table.string("category").notNullable();
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_employment");
  }
}

const item = new Table();

export default item;
