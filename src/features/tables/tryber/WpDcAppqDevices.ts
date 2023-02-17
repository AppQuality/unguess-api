import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_dc_appq_devices");
  }

  public create() {
    return tryber.schema.createTable("wp_dc_appq_devices", function (table) {
      table.increments("id").notNullable();
      table.string("manufacturer");
      table.string("model");
      table.integer("platform_id");
      table.string("os_version");
      table.integer("device_type").defaultTo(0);
      table.integer("display_size").defaultTo(0.0);
      table.integer("display_width").notNullable().defaultTo(0);
      table.integer("display_height").notNullable().defaultTo(0);
      table.integer("display_ppi").defaultTo(0);
      table.integer("device_height").defaultTo(0.0);
      table.integer("device_width").defaultTo(0.0);
      table.integer("device_length").defaultTo(0.0);
      table.integer("has_nfc").defaultTo(0);
      table.integer("has_fingerprint").defaultTo(0);
      table.integer("has_face_unlock").defaultTo(0);
      table.string("biometrics");
      table.string("connectivity");
      table.timestamp("creation_time").notNullable().defaultTo(tryber.fn.now());
      table.timestamp("update_time").notNullable().defaultTo(tryber.fn.now());
      table.integer("source_id");
      table.unique(["source_id"]);
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_dc_appq_devices");
  }
}

const item = new Table();

export default item;
