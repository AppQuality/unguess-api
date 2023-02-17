import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_user_to_project");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_user_to_project",
      function (table) {
        table.integer("wp_user_id").notNullable();
        table.integer("project_id").notNullable();
        table.unique(["wp_user_id", "project_id"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_user_to_project");
  }
}

const item = new Table();

export default item;
