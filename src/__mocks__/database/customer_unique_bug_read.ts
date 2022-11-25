import Table from "./table";

type CustomerUniqueBugsReadParams = {
  wp_user_id?: number;
  campaign_id?: number;
  bugs_read?: number;
  update_time?: number;
};

const defaultItem: CustomerUniqueBugsReadParams = {
  wp_user_id: 0,
  campaign_id: 0,
  bugs_read: 0,
};
class CustomerUniqueBugsRead extends Table<CustomerUniqueBugsReadParams> {
  protected name = "wp_appq_unique_bug_read";
  protected columns = [
    "wp_user_id INTEGER(11) NOT NULL",
    "campaign_id INTEGER(11) NOT NULL",
    "bugs_read INTEGER(11) NOT NULL",
    "update_time TIMESTAMP NOT NULL",
  ];
  constructor() {
    super(defaultItem);
  }
}
const table = new CustomerUniqueBugsRead();
export default table;
export type { CustomerUniqueBugsReadParams };
