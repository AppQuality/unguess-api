import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_redirection_items");
  }

  public create() {
    return tryber.schema.createTable("wp_redirection_items", function (table) {
      table.increments("id").notNullable();
      table.string("url").notNullable();
      table.string("match_url");
      table.string("match_data");
      table.integer("regex").notNullable().defaultTo(0);
      table.integer("position").notNullable().defaultTo(0);
      table.integer("last_count").notNullable().defaultTo(0);
      table
        .string("last_access")
        .notNullable()
        .defaultTo("1970-01-01 00:00:00");
      table.integer("group_id").notNullable().defaultTo(0);
      table.string("status").notNullable().defaultTo("enabled");
      table.string("action_type").notNullable();
      table.integer("action_code").notNullable();
      table.string("action_data");
      table.string("match_type").notNullable();
      table.string("title");
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_redirection_items");
  }
}

const item = new Table();

export default item;
