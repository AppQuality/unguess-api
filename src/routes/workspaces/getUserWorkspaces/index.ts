import * as db from "../../../features/db";
import { getGravatar } from "@src/routes/users/utils";
import { formatCount } from "@src/routes/workspaces/paginateItems";

const fallBackCsmProfile = {
  id: 20739,
  name: "Gianluca",
  surname: "Peretti",
  email: "gianluca.peretti@unguess.io",
  role: "admin",
  workspaces: [],
};

export default async (
  user: UserType,
  limit: any,
  start: any
): Promise<{
  workspaces: StoplightComponents["schemas"]["Workspace"][] | [];
  total: number;
}> => {
  const baseCustomerSql =
    "SELECT c.*, p.name as csmName, p.surname as csmSurname, p.email as csmEmail FROM wp_appq_customer c JOIN wp_appq_user_to_customer utc ON (c.id = utc.customer_id) LEFT JOIN wp_appq_evd_profile p ON (p.id = c.pm_id)";

  const LIMIT = `LIMIT ${limit} OFFSET ${start}`;

  const countQuery = `SELECT COUNT(*) FROM wp_appq_customer c 
                       JOIN wp_appq_user_to_customer utc ON (c.id = utc.customer_id) 
                       LEFT JOIN wp_appq_evd_profile p ON (p.id = c.pm_id)`;

  if (user.role !== "administrator") {
    if (!user.profile_id || !user.tryber_wp_user_id) {
      return { workspaces: [], total: 0 };
    }

    try {
      // Get customer name
      const customerSql = `${baseCustomerSql} WHERE utc.wp_user_id = ? ${LIMIT}`;
      let customers = await db.query(
        db.format(customerSql, [user.tryber_wp_user_id]),
        "tryber"
      );
      const customerCountQuery = `${countQuery} WHERE utc.wp_user_id = ? ${LIMIT}`;
      let total = await db.query(
        db.format(customerCountQuery, [user.tryber_wp_user_id])
      );
      total = formatCount(total);

      if (customers.length) {
        return { workspaces: await prepareResponse(customers), total };
      }

      return { workspaces: [], total: 0 };
    } catch (error) {
      console.error(error);
      return { workspaces: [], total: 0 };
    }
  } else {
    try {
      // Get customer name
      let customers = await db.query(`${baseCustomerSql} ${LIMIT}`, "tryber");
      let total = await db.query(countQuery);
      total = formatCount(total);

      if (customers.length) {
        return { workspaces: await prepareResponse(customers), total };
      }

      return { workspaces: [], total: 0 };
    } catch (error) {
      console.error(error);
      return { workspaces: [], total: 0 };
    }
  }
};

let csmProfiles: {
  [id: number]: StoplightComponents["schemas"]["Workspace"]["csm"];
} = {};

const loadCsmData = async (
  csm: StoplightComponents["schemas"]["Workspace"]["csm"]
) => {
  if (csm.id in csmProfiles) return csmProfiles[csm.id];

  let profilePic = await getGravatar(csm.email);
  if (profilePic) csm.picture = profilePic;
  csmProfiles[csm.id] = csm;

  return csm;
};

const prepareResponse = async (
  customers: Array<any>
): Promise<StoplightComponents["schemas"]["Workspace"][] | []> => {
  let workspaces: StoplightComponents["schemas"]["Workspace"][] = [];

  for (const customer of customers) {
    let rawCsm = customer.pm_id
      ? {
          id: customer.pm_id,
          name: customer.csmName + " " + customer.csmSurname,
          email: customer.csmEmail,
          role: "admin",
          workspaces: [],
        }
      : fallBackCsmProfile;

    let csm = await loadCsmData(rawCsm);

    workspaces.push({
      id: customer.id,
      company: customer.company,
      logo: customer.company_logo || "",
      tokens: customer.tokens,
      csm: csm,
    });
  }

  return workspaces;
};
