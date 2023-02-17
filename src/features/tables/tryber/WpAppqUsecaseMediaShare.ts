import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_usecase_media_share");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_usecase_media_share",
      function (table) {
        table.increments("id").notNullable();
        table.integer("media_id").notNullable();
        table.string("share_link").notNullable();
        table
          .timestamp("creation_date")
          .notNullable()
          .defaultTo(tryber.fn.now());
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_usecase_media_share");
  }
}

const item = new Table();

export default item;
