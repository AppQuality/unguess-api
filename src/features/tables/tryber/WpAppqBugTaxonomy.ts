import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_bug_taxonomy");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_bug_taxonomy", function (table) {
      table.increments("id").notNullable();
      table.integer("tag_id").notNullable();
      table.string("display_name").notNullable().defaultTo("");
      table.string("slug").notNullable().defaultTo("");
      table.integer("bug_id").notNullable();
      table.integer("campaign_id").notNullable();
      table.string("description").notNullable();
      table.integer("author_wp_id").notNullable().defaultTo(0);
      table.integer("author_tid").notNullable().defaultTo(0);
      table.timestamp("creation_date").notNullable().defaultTo(tryber.fn.now());
      table.integer("is_public").notNullable().defaultTo(1);
      table.unique(["tag_id", "bug_id"]);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_bug_taxonomy");
  }
}

const item = new Table();

export default item;
