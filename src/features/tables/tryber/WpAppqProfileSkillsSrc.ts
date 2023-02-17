import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_profile_skills_src");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_profile_skills_src",
      function (table) {
        table.increments("id").notNullable();
        table.string("display_name");
        table
          .timestamp("creation_date")
          .notNullable()
          .defaultTo(tryber.fn.now());
        table.integer("is_certification").notNullable().defaultTo(0);
        table.unique(["display_name"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_profile_skills_src");
  }
}

const item = new Table();

export default item;
