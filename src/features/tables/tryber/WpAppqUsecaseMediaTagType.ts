import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_usecase_media_tag_type");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_usecase_media_tag_type",
      function (table) {
        table.increments("id").notNullable();
        table.integer("campaign_id").notNullable();
        table.string("name").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_usecase_media_tag_type");
  }
}

const item = new Table();

export default item;
