/** OPENAPI-ROUTE: get-workspaces */
import { Context } from "openapi-backend";
import { paginateItems } from "@src/utils/paginations";
import { getGravatar } from "@src/utils/users";
import { formatCount } from "@src/utils/paginations";
import { tryber } from "@src/features/database";
import {
  ERROR_MESSAGE,
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
  fallBackCsmProfile,
} from "@src/utils/constants";
import {
  WorkspaceOrderBy,
  WorkspaceOrders,
} from "@src/utils/workspaces/getUserWorkspaces";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let error = {
    error: true,
    message: ERROR_MESSAGE,
  } as StoplightComponents["schemas"]["Error"];

  try {
    const limit = c.request.query.limit
      ? parseInt(c.request.query.limit as string)
      : (LIMIT_QUERY_PARAM_DEFAULT as StoplightComponents["parameters"]["limit"]);
    const start = c.request.query.start
      ? parseInt(c.request.query.start as string)
      : (START_QUERY_PARAM_DEFAULT as StoplightComponents["parameters"]["start"]);

    const order =
      c.request.query.order &&
      ["ASC", "DESC"].includes((c.request.query.order as string).toUpperCase())
        ? ((c.request.query.order as string).toUpperCase() as WorkspaceOrders)
        : "ASC";

    const orderBy =
      c.request.query.orderBy &&
      ["id", "company", "tokens"].includes(
        (c.request.query.orderBy as string).toLowerCase()
      )
        ? ((
            c.request.query.orderBy as string
          ).toLowerCase() as WorkspaceOrderBy)
        : "id";

    let userWorkspaces = await getUserWorkspaces(req.user, {
      limit,
      start,
      ...(order && { order: order }),
      ...(orderBy && { orderBy: orderBy }),
    });

    if (userWorkspaces.workspaces.length) {
      res.status_code = 200;
      return await paginateItems({
        items: userWorkspaces.workspaces,
        limit,
        start,
        total: userWorkspaces.total,
      });
    }

    return await paginateItems({ items: [], total: 0 });
  } catch (e: any) {
    if (e.code) {
      error.code = e.code;
      res.status_code = e.code;
    } else {
      error.code = 500;
      res.status_code = 500;
    }

    return error;
  }
};
interface GetWorkspacesArgs {
  limit?: StoplightComponents["parameters"]["limit"];
  start?: StoplightComponents["parameters"]["start"];
  orderBy?: WorkspaceOrderBy;
  order?: WorkspaceOrders;
}
async function getUserWorkspaces(
  user: UserType,
  args: GetWorkspacesArgs = {}
): Promise<{
  workspaces: StoplightComponents["schemas"]["Workspace"][] | [];
  total: number;
}> {
  const { limit, start, order, orderBy } = args;
  let query = tryber.tables.WpAppqCustomer.do()
    .select(
      "wp_appq_customer.*",
      tryber.ref("wp_appq_evd_profile.name").as("csmName"),
      tryber.ref("wp_appq_evd_profile.surname").as("csmSurname"),
      tryber.ref("wp_appq_evd_profile.email").as("csmEmail"),
      tryber.ref("wp_appq_evd_profile.id").as("csmProfileId"),
      tryber.ref("wp_appq_evd_profile.wp_user_id").as("csmTryberWpUserId"),
      tryber.ref("wp_users.user_url").as("csmUserUrl")
    )
    .join(
      "wp_appq_user_to_customer",
      "wp_appq_customer.id",
      "wp_appq_user_to_customer.customer_id"
    )
    .leftJoin(
      "wp_appq_evd_profile",
      "wp_appq_customer.pm_id",
      "wp_appq_evd_profile.id"
    )
    .leftJoin("wp_users", "wp_appq_evd_profile.wp_user_id", "wp_users.ID")
    .groupBy("wp_appq_customer.id");

  if (user.role !== "administrator") {
    query = query.where(
      "wp_appq_user_to_customer.wp_user_id",
      user.tryber_wp_user_id ? user.tryber_wp_user_id : 0
    );
  }

  if (orderBy) {
    query = query.orderBy(`wp_appq_customer.${orderBy}`, `${order || "ASC"}`);
  }

  if (limit) {
    query = query
      .limit(limit)
      .offset(start ? start : START_QUERY_PARAM_DEFAULT);
  }

  let countQuery = tryber.tables.WpAppqCustomer.do()
    .countDistinct("wp_appq_customer.id as count")
    .join(
      "wp_appq_user_to_customer",
      "wp_appq_customer.id",
      "wp_appq_user_to_customer.customer_id"
    )
    .leftJoin(
      "wp_appq_evd_profile",
      "wp_appq_customer.pm_id",
      "wp_appq_evd_profile.id"
    );

  if (user.role !== "administrator") {
    countQuery = countQuery.where(
      "wp_appq_user_to_customer.wp_user_id",
      user.tryber_wp_user_id ? user.tryber_wp_user_id : 0
    );
  }

  try {
    if (
      user.role !== "administrator" &&
      (!user.profile_id || !user.tryber_wp_user_id)
    )
      return { workspaces: [], total: 0 };

    const result = await query;

    const countResult = await countQuery;

    if (result.length)
      return {
        workspaces: await prepareResponse(result),
        total: formatCount(countResult),
      };

    return { workspaces: [], total: 0 };
  } catch (e) {
    console.log(e.message);
    return { workspaces: [], total: 0 };
  }
}

async function prepareResponse(
  customers: Array<any>
): Promise<StoplightComponents["schemas"]["Workspace"][] | []> {
  let workspaces: StoplightComponents["schemas"]["Workspace"][] = [];

  for (const customer of customers) {
    let rawCsm = customer.pm_id
      ? {
          id: customer.pm_id,
          name: customer.csmName + " " + customer.csmSurname,
          email: customer.csmEmail,
          //???? role: "admin",
          profile_id: customer.csmProfileId,
          tryber_wp_user_id: customer.csmTryberWpUserId,
          ...(customer.csmUserUrl && { url: customer.csmUserUrl }),
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
}

let csmProfiles: {
  [id: number]: StoplightComponents["schemas"]["Workspace"]["csm"];
} = {};

async function loadCsmData(
  csm: StoplightComponents["schemas"]["Workspace"]["csm"]
) {
  if (csm.id in csmProfiles) return csmProfiles[csm.id];

  let profilePic = await getGravatar(csm.email);
  if (profilePic) csm.picture = profilePic;
  csmProfiles[csm.id] = csm;

  return csm;
}
