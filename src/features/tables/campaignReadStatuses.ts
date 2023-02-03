import { unguess } from "../knex";

interface iTable {
  is_read: number;
  last_read_on: string;
  read_on: string;
  campaign_id: number;
  unguess_wp_user_id: number;
}

const table = () => unguess<iTable>("wp_ug_campaign_read_status");

const create = () =>
  unguess.schema.createTable("wp_ug_campaign_read_status", function (table) {
    table.increments("id");
    table.integer("unguess_wp_user_id");
    table.integer("campaign_id");
    table.boolean("is_read");
    table.timestamp("read_on");
    table.timestamp("last_read_on");
    table.unique(["unguess_wp_user_id", "campaign_id"]);
  });

const drop = () => unguess.schema.dropTable("wp_ug_campaign_read_status");

export default table;
export { create, drop };
