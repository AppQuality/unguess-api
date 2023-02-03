import { unguess } from "@src/features/knex";

interface iTable {
  id: number;
  unguess_wp_user_id: number;
  campaign_id: number;
  is_read: number;
  read_on: string;
  last_read_on: string;
}

const table = () => unguess<iTable>("wp_ug_campaign_read_status}");

const create = () =>
  unguess.schema.createTable("wp_ug_campaign_read_status}", function (table) {
    table.integer("id");
    table.integer("unguess_wp_user_id");
    table.integer("campaign_id");
    table.integer("is_read");
    table.timestamp("read_on");
    table.timestamp("last_read_on");
    table.unique(["campaign_id", "unguess_wp_user_id"]);
  });

const drop = () => unguess.schema.dropTable("wp_ug_campaign_read_status}");

export default table;
export { create, drop };
