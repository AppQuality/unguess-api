/** OPENAPI-ROUTE: get-workspaces-coins */
import { Context } from "openapi-backend";
import { fallBackCsmProfile } from "@src/utils/constants";
import {
  ERROR_MESSAGE,
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
} from "@src/utils/constants";
import { getGravatar } from "@src/utils/users/getGravatar";
import { getTotalCoins } from "@src/utils/workspaces";
import { tryber, unguess } from "@src/features/database";

const fields = ["id", "customer_id", "amount", "price", "agreement_id"];
const orders = ["ASC", "DESC"];

const prepareResponse = (
  coins: any[]
): StoplightComponents["schemas"]["Coin"][] => {
  return coins.map((coin) => {
    return {
      id: coin.id,
      customer_id: coin.customer_id,
      amount: coin.amount,
      price: coin.price,
      ...(coin.agreement_id && { agreement_id: coin.agreement_id }),
      ...(coin.created_on && { created_on: coin.created_on.toString() }),
      ...(coin.updated_on && { updated_on: coin.updated_on.toString() }),
    };
  });
};

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;
  res.status_code = 200;

  let error = {
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  const limit = c.request.query.limit
    ? parseInt(c.request.query.limit as string)
    : (LIMIT_QUERY_PARAM_DEFAULT as StoplightComponents["parameters"]["limit"]);

  const start = c.request.query.start
    ? parseInt(c.request.query.start as string)
    : (START_QUERY_PARAM_DEFAULT as StoplightComponents["parameters"]["start"]);

  const orderBy =
    c.request.query.orderBy &&
    fields.includes(c.request.query.orderBy as string)
      ? (c.request.query.orderBy as string)
      : "id";

  const order =
    c.request.query.order &&
    orders.includes((c.request.query.order as string).toLocaleUpperCase())
      ? (c.request.query.order as string)
      : "DESC";

  try {
    let wid = Number.parseInt(c.request.params.wid as string);

    const ws = await getWorkspace({
      workspaceId: wid,
      user: user,
    });

    if (!ws) {
      error.code = 403;
      res.status_code = 403;
      return error;
    }

    const coins = await getWorkspaceCoins({
      workspaceId: wid,
      limit,
      start,
      orderBy,
      order,
    });

    const countQuery = await unguess.tables.WpUgCoins.do()
      .count("* as count")
      .where("customer_id", wid)
      .first();

    const total = countQuery.count ? countQuery.count : 0;

    return paginateItems({
      items: prepareResponse(coins),
      start,
      limit,
      total,
    });
  } catch (e: any) {
    if (e.code) {
      console.log(e.message);
      error.code = e.code;
      res.status_code = e.code;
    } else {
      error.code = 500;
      res.status_code = 500;
    }

    return error;
  }
};
type PaginationParams = {
  items: Array<any>;
  limit?: StoplightComponents["parameters"]["limit"] | string;
  start?: StoplightComponents["parameters"]["start"] | string;
  total: number;
};

function paginateItems(data: PaginationParams) {
  let { items, limit, start, total } = data;

  if (typeof total === "string") {
    total = parseInt(total);
  }

  return items.length
    ? {
        items,
        start,
        limit,
        size: items.length,
        total,
      }
    : emptyPaginatedResponse();
}

function emptyPaginatedResponse() {
  return {
    items: [],
    start: 0,
    limit: 0,
    size: 0,
    total: 0,
  };
}

async function loadCsmData(
  csm: StoplightComponents["schemas"]["Workspace"]["csm"]
) {
  let profilePic = await getGravatar(csm.email);
  if (profilePic) csm.picture = profilePic;

  return csm;
}

interface GetWorkspacesArgs {
  user: UserType;
  workspaceId?: number;
}

async function getWorkspace({
  workspaceId,
  user,
}: GetWorkspacesArgs): Promise<
  StoplightComponents["schemas"]["Workspace"] | false
> {
  let error = {
    message: ERROR_MESSAGE + " with workspace",
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Check parameters
  if (workspaceId == null || Number.isNaN(workspaceId) || workspaceId < 1)
    throw { ...error, code: 400 };

  if (user.role !== "administrator")
    if (user.id == null || user.id <= 0) throw { ...error, code: 400 };

  // Check if workspace exists

  const customerSql = tryber.tables.WpAppqCustomer.do()
    .select(
      "wp_appq_customer.*",
      tryber.ref("name").withSchema("wp_appq_evd_profile").as("csmName"),
      tryber.ref("surname").withSchema("wp_appq_evd_profile").as("csmSurname"),
      tryber.ref("email").withSchema("wp_appq_evd_profile").as("csmEmail"),
      tryber.ref("id").withSchema("wp_appq_evd_profile").as("csmProfileId"),
      tryber
        .ref("wp_user_id")
        .withSchema("wp_appq_evd_profile")
        .as("csmTryberWpUserId"),
      tryber.ref("user_url").withSchema("wp_users").as("csmUserUrl")
    )
    .leftJoin(
      "wp_appq_evd_profile",
      "wp_appq_evd_profile.id",
      "wp_appq_customer.pm_id"
    )
    .leftJoin("wp_users", "wp_users.ID", "wp_appq_evd_profile.wp_user_id")
    .where("wp_appq_customer.id", workspaceId)
    .first();

  let workspace = await customerSql;

  if (workspace) {
    if (user.role !== "administrator") {
      // Check if user has permission to get the customer

      const userToCustomerSql = tryber.tables.WpAppqUserToCustomer.do()
        .select()
        .where("wp_user_id", user.id || 0)
        .where("customer_id", workspaceId)
        .first();

      let userToCustomer = await userToCustomerSql;

      if (!userToCustomer) {
        throw { ...error, message: "workspace issue", code: 403 };
      }
    }

    //Add CSM info

    let rawCsm = workspace.pm_id
      ? {
          id: workspace.pm_id,
          name: workspace.csmName + " " + workspace.csmSurname,
          email: workspace.csmEmail,
          profile_id: workspace.csmProfileId,
          tryber_wp_user_id: workspace.csmTryberWpUserId,
          ...(workspace.csmUserUrl && { url: workspace.csmUserUrl }),
        }
      : fallBackCsmProfile;

    let csm = await loadCsmData(rawCsm);

    // Get workspace's express coins
    const coins = await getWorkspaceCoins({ workspaceId });

    // Get total coins amount
    const totalCoins = await getTotalCoins(coins);

    return {
      id: workspace.id,
      company: workspace.company,
      tokens: workspace.tokens,
      ...(workspace.company_logo && { logo: workspace.company_logo }),
      csm: csm,
      coins: totalCoins,
    } as StoplightComponents["schemas"]["Workspace"];
  }

  return false;
}

interface GetWorkspacesCoinsArgs {
  workspaceId: number;
  limit?: number;
  start?: number;
  orderBy?: string;
  order?: string;
}

/**
 * Retrieve coins from a workspace
 *
 * Notes: we don't check if the user has permission to get the workspace, because this is done in the getWorkspace function
 *
 * @param workspaceId
 * @returns array of coins
 */
async function getWorkspaceCoins({
  workspaceId,
  limit,
  start,
  orderBy,
  order,
}: GetWorkspacesCoinsArgs): Promise<StoplightComponents["schemas"]["Coin"][]> {
  let error = {
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Check parameters
  if (workspaceId == null || workspaceId <= 0) throw { ...error, code: 400 };

  // Retrieve coins packages

  let query = unguess.tables.WpUgCoins.do()
    .select()
    .where("customer_id", workspaceId)
    .where("amount", ">", 0);

  if (order && orderBy) {
    query = query.orderBy(orderBy, order);
  }

  if (limit || start) {
    query = query.limit(limit || 10).offset(start || 0);
  }
  let packages = await query;

  return packages.length ? packages : [];
}
