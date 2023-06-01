import Table from "./tryber_table";

type CustomerParams = {
  id?: number;
  company?: string;
  company_logo?: string;
  tokens?: number;
  pm_id?: number;
};
const defaultItem: CustomerParams = {
  id: 1,
  company: "Company",
  company_logo: "logo.png",
  tokens: 100,
};

class Customers extends Table<CustomerParams> {
  protected name = "wp_appq_customer";
  protected columns = [
    "id int(11) PRIMARY KEY",
    "company varchar(64)",
    "company_logo varchar(300)",
    "tokens int(11)",
    "pm_id int(11) DEFAULT NULL",
  ];
  constructor() {
    super(defaultItem);
  }
}
const customers = new Customers();
export default customers;
export type { CustomerParams };
export { data };

// Backward compatibility
const data = {
  basicItem: async (params: CustomerParams) => {
    return await customers.insert({ pm_id: 1, ...params });
  },
};
