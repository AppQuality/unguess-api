import { unguess } from "@src/features/knex";

interface iTable {
  bug_id: number;
  type_id: number;
  value: string;
}

const table = () => unguess<iTable>("wp_appq_campaign_additional_fields_data");

const create = () =>
  unguess.schema.createTable(
    "wp_appq_campaign_additional_fields_data",
    function (table) {
      table.integer("bug_id").notNullable();
      table.integer("type_id").notNullable();
      table.string("value").notNullable();
      table.unique(["bug_id", "type_id"]);
    }
  );

const drop = () =>
  unguess.schema.dropTable("wp_appq_campaign_additional_fields_data");

export default table;
export { create, drop };
