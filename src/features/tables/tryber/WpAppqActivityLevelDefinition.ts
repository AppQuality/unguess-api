import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_activity_level_definition");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_activity_level_definition",
      function (table) {
        table.integer("id").notNullable();
        table.string("name").notNullable();
        table.integer("reach_exp_pts");
        table.integer("hold_exp_pts");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_activity_level_definition");
  }
}

const item = new Table();

export default item;
