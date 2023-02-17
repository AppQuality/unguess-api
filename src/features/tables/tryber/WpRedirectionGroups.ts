import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_redirection_groups");
  }

  public create() {
    return tryber.schema.createTable("wp_redirection_groups", function (table) {
      table.increments("id").notNullable();
      table.string("name").notNullable();
      table.integer("tracking").notNullable().defaultTo(1);
      table.integer("module_id").notNullable().defaultTo(0);
      table.string("status").notNullable().defaultTo("enabled");
      table.integer("position").notNullable().defaultTo(0);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_redirection_groups");
  }
}

const item = new Table();

export default item;
