import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_crowd_appq_device");
  }

  public create() {
    return tryber.schema.createTable("wp_crowd_appq_device", function (table) {
      table.increments("id").notNullable();
      table.string("manufacturer");
      table.string("model");
      table.string("network");
      table.integer("platform_id");
      table.integer("id_profile");
      table.string("os_version");
      table.string("operating_system");
      table.integer("enabled").defaultTo(1);
      table.string("form_factor");
      table.timestamp("creation_time").notNullable().defaultTo(tryber.fn.now());
      table.string("pc_type");
      table.integer("os_version_id");
      table.integer("architecture");
      table.integer("source_id");
      table.timestamp("update_time").defaultTo(tryber.fn.now());
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_crowd_appq_device");
  }
}

const item = new Table();

export default item;
