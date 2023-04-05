import Table from "./tryber_table";

type CustomerInvitationParams = {
  id?: number;
  token?: string;
  status?: string;
  tester_id?: number;
};

const defaultItem: CustomerInvitationParams = {
  token: "???",
  status: "0",
};
class CustomerInvitation extends Table<CustomerInvitationParams> {
  protected name = "wp_appq_customer_account_invitations";
  protected columns = [
    "id INTEGER PRIMARY KEY NOT NULL",
    "token VARCHAR(64)",
    "status VARCHAR(32)",
    "tester_id INTEGER",
  ];

  constructor() {
    super(defaultItem);
  }
}
const invitation = new CustomerInvitation();
export default invitation;
export type { CustomerInvitationParams };
