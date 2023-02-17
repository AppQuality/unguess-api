import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_certifications_list");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_certifications_list",
      function (table) {
        table.increments("id").notNullable();
        table.string("name").notNullable();
        table.string("abbreviation");
        table.string("area").notNullable();
        table.string("institute").notNullable();
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_certifications_list");
  }
}

const item = new Table();

export default item;
