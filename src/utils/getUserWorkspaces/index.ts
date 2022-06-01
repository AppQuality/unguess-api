import * as db from "@src/features/db";
import { getGravatar } from "@src/utils/getGravatar";
import { formatCount } from "@src/utils/paginateItems";
import {
  fallBackCsmProfile,
  START_QUERY_PARAM_DEFAULT,
} from "@src/utils/consts";

interface GetWorkspacesArgs {
  limit?: StoplightComponents["parameters"]["limit"];
  start?: StoplightComponents["parameters"]["start"];
  orderBy?: "c.id" | "c.company" | "c.tokens";
  order?: "ASC" | "DESC";
}

export const getUserWorkspaces = async (
  user: UserType,
  args: GetWorkspacesArgs = {}
): Promise<{
  workspaces: StoplightComponents["schemas"]["Workspace"][] | [];
  total: number;
}> => {
  const { limit, start, order, orderBy } = args;

  let query = `SELECT c.*, p.name as csmName, p.surname as csmSurname, p.email as csmEmail, p.id as csmProfileId, p.wp_user_id as csmTryberWpUserId 
        FROM wp_appq_customer c 
        JOIN wp_appq_user_to_customer utc ON (c.id = utc.customer_id) 
        LEFT JOIN wp_appq_evd_profile p ON (p.id = c.pm_id)
        ${
          user.role !== "administrator" ? `WHERE utc.wp_user_id = ?` : ``
        } GROUP BY c.id`;

  if (orderBy) {
    query += ` ORDER BY ${orderBy} ${order || "ASC"}`;
  }

  if (limit) {
    query += ` LIMIT ${limit} OFFSET ${start || START_QUERY_PARAM_DEFAULT}`;
  }

  let countQuery = `SELECT COUNT(*) 
        FROM wp_appq_customer c 
        JOIN wp_appq_user_to_customer utc ON (c.id = utc.customer_id) 
        LEFT JOIN wp_appq_evd_profile p ON (p.id = c.pm_id)
        ${
          user.role !== "administrator" ? `WHERE utc.wp_user_id = ?` : ``
        } GROUP BY c.id`;

  try {
    if (
      user.role !== "administrator" &&
      (!user.profile_id || !user.tryber_wp_user_id)
    )
      return { workspaces: [], total: 0 };

    query = db.format(query, [user.tryber_wp_user_id || 0]);
    countQuery = db.format(countQuery, [user.tryber_wp_user_id || 0]);
    const result = await db.query(query, "tryber");
    const countResult = await db.query(countQuery, "tryber");

    if (result.length)
      return {
        workspaces: await prepareResponse(result),
        total: formatCount(countResult),
      };

    return { workspaces: [], total: 0 };
  } catch (e) {
    return { workspaces: [], total: 0 };
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
          profile_id: customer.csmProfileId,
          tryber_wp_user_id: customer.csmTryberWpUserId,
          workspaces: [],
        }
      : fallBackCsmProfile;

    let csm = await loadCsmData(rawCsm);

    workspaces.push({
      id: customer.id,
      company: customer.company,
      logo: customer.company_logo || "",
      tokens: customer.tokens,
      csm,
    });
  }

  return workspaces;
};
