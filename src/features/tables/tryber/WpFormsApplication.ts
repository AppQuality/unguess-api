import { tryber } from "@src/features/knex";

class Table {
  public do() {
    return tryber("wp_forms_application");
  }

  public create() {
    return tryber.schema.createTable("wp_forms_application", function (table) {
      table.increments("id").notNullable();
      table.string("campaign_id");
      table.string("tester_id");
      table.string("tester_mail");
      table.string("jotform_id");
      table.string("submission_id");
      table.string("form_title");
      table.string("tester_ip");
      table.string("rawRequest");
      table.string("pretty_data");
      table.string("creation_date");
    });
  }
  public drop() {
    return tryber.schema.dropTable("wp_forms_application");
  }
}

const item = new Table();

export default item;
