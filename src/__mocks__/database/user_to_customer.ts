import Table from "./tryber_table";

type UserToCustomerParams = {
  wp_user_id?: number;
  customer_id?: number;
};
const defaultItem: UserToCustomerParams = {
  wp_user_id: 1,
  customer_id: 1,
};

class UserToCustomers extends Table<UserToCustomerParams> {
  protected name = "wp_appq_user_to_customer";
  protected columns = ["wp_user_id int(11)", "customer_id int(11)"];
  constructor() {
    super(defaultItem);
  }
}
const userToCustomers = new UserToCustomers();
export default userToCustomers;
export type { UserToCustomerParams };

// Backward compatibility
const data = {
  basicItem: async (params: UserToCustomerParams) => {
    return await userToCustomers.insert(params);
  },
};

export { data };
