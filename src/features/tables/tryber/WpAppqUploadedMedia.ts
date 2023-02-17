import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_uploaded_media");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_uploaded_media",
      function (table) {
        table.increments("id").notNullable();
        table.string("url").notNullable();
        table.string("creation_date").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_uploaded_media");
  }
}

const item = new Table();

export default item;
