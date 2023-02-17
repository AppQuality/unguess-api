import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_lang");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_lang", function (table) {
      table.increments("id").notNullable();
      table.string("display_name").notNullable();
      table.string("lang_code").notNullable();
      table.unique(["lang_code"]);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_lang");
  }
}

const item = new Table();

export default item;
