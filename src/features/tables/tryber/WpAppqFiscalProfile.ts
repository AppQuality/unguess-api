import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_appq_fiscal_profile");
  }

  public create() {
    return tryber.schema.createTable(
      "wp_appq_fiscal_profile",
      function (table) {
        table.increments("id").notNullable();
        table.integer("tester_id").notNullable();
        table.string("fiscal_id");
        table.string("name").notNullable();
        table.string("surname").notNullable();
        table.string("sex").notNullable();
        table.datetime("birth_date").notNullable();
        table.string("birth_city");
        table.string("birth_province");
        table.string("birth_country");
        table.string("address");
        table.string("address_number");
        table.string("postal_code");
        table.string("city");
        table.string("province");
        table.string("country");
        table.integer("fiscal_italian_residence");
        table.integer("fiscal_category").defaultTo(1);
        table.integer("withholding_tax_percentage");
        table.integer("is_verified").defaultTo(0);
        table.integer("verification_in_progress").defaultTo(0);
        table.integer("is_active").defaultTo(1);
        table.timestamp("verified_on").notNullable().defaultTo(tryber.fn.now());
        table.timestamp("created_on").notNullable().defaultTo(tryber.fn.now());
        table.string("verification_notes");
      }
    );
  }
  public drop() {
    return tryber.schema.dropTable("wp_appq_fiscal_profile");
  }
}

const item = new Table();

export default item;
