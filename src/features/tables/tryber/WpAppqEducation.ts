import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_education");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_education", function (table) {
      table.increments("id").notNullable();
      table.string("display_name").notNullable();
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_education");
  }
}

const item = new Table();

export default item;
