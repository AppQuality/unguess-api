import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_usecase_media_observations_tags");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_usecase_media_observations_tags",
      function (table) {
        table.increments("id").notNullable();
        table.string("name").notNullable();
        table.string("style").notNullable();
        table.integer("type").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_usecase_media_observations_tags");
  }
}

const item = new Table();

export default item;
