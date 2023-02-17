import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_usecase_media_observations");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_usecase_media_observations",
      function (table) {
        table.increments("id").notNullable();
        table.integer("media_id").notNullable();
        table.integer("video_ts").notNullable();
        table.string("name").notNullable();
        table.string("description").notNullable();
        table.string("ux_note").notNullable();
        table.integer("favorite").defaultTo(0);
        table.unique(["video_ts", "media_id"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_usecase_media_observations");
  }
}

const item = new Table();

export default item;
