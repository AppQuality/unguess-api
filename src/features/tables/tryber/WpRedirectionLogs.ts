import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_redirection_logs");
  }

  public create() {
    return tryber.schema.createTable("wp_redirection_logs", function (table) {
      table.increments("id").notNullable();
      table.string("created").notNullable();
      table.string("url").notNullable();
      table.string("domain");
      table.string("sent_to");
      table.string("agent");
      table.string("referrer");
      table.integer("http_code").notNullable().defaultTo(0);
      table.string("request_method");
      table.string("request_data");
      table.string("redirect_by");
      table.integer("redirection_id");
      table.string("ip");
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_redirection_logs");
  }
}

const item = new Table();

export default item;
