import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_usecase_media_observations_tags_link");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_usecase_media_observations_tags_link",
      function (table) {
        table.increments("id").notNullable();
        table.integer("tag_id").notNullable();
        table.integer("observation_id").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable(
      "wp_appq_usecase_media_observations_tags_link"
    );
  }
}

const item = new Table();

export default item;
