/** OPENAPI-ROUTE: get-workspaces */
import { Context } from "openapi-backend";
import * as db from "../../../features/db";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;

  res.status_code = 200;

  if (user.profile_id && user.tryber_wp_user_id) {
    try {
      // Get customer name
      const customerSql =
        "SELECT * FROM wp_appq_customer c JOIN wp_appq_user_to_customer utc ON (c.id = utc.customer_id) WHERE utc.wp_user_id = ?";
      let customers = await db.query(
        db.format(customerSql, [user.tryber_wp_user_id]),
        "tryber"
      );

      if (customers.length) {
        let customers_data: any = [];
        customers.forEach((customer: any) => {
          let customer_data: any = {};
          customer_data.id = customer.id;
          customer_data.company = customer.company;
          customer_data.logo = customer.company_logo || "";
          customer_data.tokens = customer.tokens;
          customers_data.push(customer_data);
        });

        return customers_data;
      }

      res.status_code = 404;
      return [];
    } catch (error) {
      console.error(error);
      res.status_code = 500;
    }
  } else {
    try {
      // Get customer name
      const customerSql = "SELECT * FROM wp_appq_customer";
      let customers = await db.query(customerSql, "tryber");

      if (customers.length) {
        let customers_data: any = [];
        customers.forEach((customer: any) => {
          let customer_data: any = {};
          customer_data.id = customer.id;
          customer_data.company = customer.company;
          customer_data.logo = customer.company_logo || "";
          customer_data.tokens = customer.tokens;
          customers_data.push(customer_data);
        });

        return customers_data;
      }

      res.status_code = 404;
      return [];
    } catch (error) {
      console.error(error);
      res.status_code = 500;
    }
  }
};
