import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_profile_certifications");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_profile_certifications",
      function (table) {
        table.increments("id").notNullable();
        table.string("institute");
        table.string("area");
        table.string("level");
        table.string("display_name");
        table.integer("tester_id").notNullable().defaultTo(-1);
        table
          .timestamp("achievement_date")
          .notNullable()
          .defaultTo(tryber.fn.now());
        table
          .timestamp("creation_date")
          .notNullable()
          .defaultTo(tryber.fn.now());
        table.integer("cert_id").notNullable();
        table.unique(["display_name", "cert_id", "tester_id", "tester_id"]);
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_profile_certifications");
  }
}

const item = new Table();

export default item;
