import { unguess } from "@src/features/knex";

interface iTable {
  id: number;
  cp_id: number;
  slug: string;
  title: string;
  type: string;
  validation: string;
  error_message: string;
  stats: number;
}

const table = () => unguess<iTable>("wp_appq_campaign_additional_fields");

const create = () =>
  unguess.schema.createTable(
    "wp_appq_campaign_additional_fields",
    function (table) {
      table.increments("id").notNullable();
      table.integer("cp_id").notNullable();
      table.string("slug").notNullable();
      table.string("title").notNullable();
      table.string("type").notNullable().defaultTo("regex");
      table.string("validation").notNullable();
      table.string("error_message").notNullable();
      table.integer("stats").notNullable().defaultTo(1);
    }
  );

const drop = () =>
  unguess.schema.dropTable("wp_appq_campaign_additional_fields");

export default table;
export { create, drop };
