import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_course");
  }

  public create() {
    return tryber.schema.createTable("wp_appq_course", function (table) {
      table.increments("id").notNullable();
      table.string("display_name").notNullable();
      table.string("preview_content").notNullable();
      table.string("completed_content").notNullable();
      table.string("failed_content").notNullable();
      table.integer("euro_prize").notNullable().defaultTo(0);
      table.integer("point_prize").notNullable();
      table.integer("time_length").notNullable();
      table.integer("priority").notNullable().defaultTo(0);
      table.string("course_level").notNullable();
      table.integer("is_public").notNullable().defaultTo(0);
      table.string("completion_hook");
      table.string("language");
      table.integer("translation_of_id");
      table.string("excerpt").notNullable();
      table.string("career");
      table.integer("level").notNullable().defaultTo(0);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_course");
  }
}

const item = new Table();

export default item;
