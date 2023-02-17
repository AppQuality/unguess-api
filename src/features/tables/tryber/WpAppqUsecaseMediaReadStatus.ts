import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_usecase_media_read_status");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_usecase_media_read_status",
      function (table) {
        table.increments("id").notNullable();
        table.integer("use_case_media_id").notNullable();
        table.integer("wp_user_id").notNullable();
        table.integer("is_read").notNullable().defaultTo(0);
        table.unique(["wp_user_id", "use_case_media_id"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_usecase_media_read_status");
  }
}

const item = new Table();

export default item;
