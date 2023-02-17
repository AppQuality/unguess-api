import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_profile_has_lang");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_profile_has_lang",
      function (table) {
        table.integer("language_id").notNullable();
        table.integer("profile_id").notNullable();
        table.unique(["profile_id", "language_id"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_profile_has_lang");
  }
}

const item = new Table();

export default item;
