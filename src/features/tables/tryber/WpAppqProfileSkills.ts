import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_profile_skills");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_profile_skills",
      function (table) {
        table.increments("id").notNullable();
        table.string("display_name");
        table.integer("tester_id").notNullable().defaultTo(-1);
        table.integer("rating").notNullable().defaultTo(0);
        table.integer("is_certified").notNullable().defaultTo(0);
        table
          .timestamp("creation_date")
          .notNullable()
          .defaultTo(tryber.fn.now());
        table.unique(["display_name", "tester_id"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_profile_skills");
  }
}

const item = new Table();

export default item;
