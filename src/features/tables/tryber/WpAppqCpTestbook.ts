import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_cp_testbook");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_cp_testbook", function (table) {
      table.increments("id").notNullable();
      table.integer("cp_id").notNullable();
      table.integer("tc_id").notNullable();
      table.string("tc_area").notNullable();
      table.integer("step_id").notNullable();
      table.string("step_text").notNullable();
      table.timestamp("creation_date").notNullable().defaultTo(tryber.fn.now());
      table.integer("creator_id").notNullable();
      table.integer("group_id").notNullable().defaultTo(1);
      table.unique(["tc_id", "group_id", "cp_id", "step_id"]);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_cp_testbook");
  }
}

const item = new Table();

export default item;
