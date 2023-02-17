import { unguess } from "@src/features/knex";

class Table {
  public do() {
    return unguess("wp_ug_user_to_feature");
  }

  public create() {
    return unguess.schema.createTable(
      "wp_ug_user_to_feature",
      function (table) {
        table.integer("unguess_wp_user_id").notNullable();
        table.integer("feature_id").notNullable();
        table.unique(["feature_id", "unguess_wp_user_id"]);
      }
    );
  }
  public drop() {
    return unguess.schema.dropTable("wp_ug_user_to_feature");
  }
}

const item = new Table();

export default item;
