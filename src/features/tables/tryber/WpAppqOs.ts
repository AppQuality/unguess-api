import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_os");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_os", function (table) {
      table.increments("id").notNullable();
      table.integer("platform_id").notNullable();
      table.integer("main_release").notNullable();
      table.integer("version_family").notNullable();
      table.string("version_number").notNullable();
      table.string("display_name").notNullable();
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_os");
  }
}

const item = new Table();

export default item;
