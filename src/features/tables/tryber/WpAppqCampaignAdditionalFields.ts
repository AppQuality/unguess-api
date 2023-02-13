import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_campaign_additional_fields");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_campaign_additional_fields",
      function (table) {
        table.increments("id").notNullable();
        table.integer("cp_id").notNullable();
        table.string("slug").notNullable();
        table.string("title").notNullable();
        table.string("type").notNullable().defaultTo("regex");
        table.string("validation").notNullable();
        table.string("error_message").notNullable();
        table.integer("stats").notNullable().defaultTo(1);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_campaign_additional_fields");
  }
}

const item = new Table();

export default item;
