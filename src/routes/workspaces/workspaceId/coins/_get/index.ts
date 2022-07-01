/** OPENAPI-ROUTE: get-workspaces-coins */
import { Context } from "openapi-backend";
import * as db from "@src/features/db";
import { getWorkspace, getWorkspaceCoins } from "@src/utils/workspaces";
import {
  ERROR_MESSAGE,
  LIMIT_QUERY_PARAM_DEFAULT,
  START_QUERY_PARAM_DEFAULT,
} from "@src/utils/constants";
import { paginateItems, formatCount } from "@src/utils/paginations";

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
    let wid = parseInt(c.request.params.wid as string);

    await getWorkspace({
      workspaceId: wid,
      user: user,
    });

    const coins = await getWorkspaceCoins({
      workspaceId: wid,
      limit,
      start,
      orderBy,
      order,
    });

    const countQuery = `SELECT COUNT(*) as count FROM wp_ug_coins c WHERE c.customer_id = ${wid}`;
    let total = await db.query(countQuery, "unguess");
    total = formatCount(total);

    return await paginateItems({
      items: prepareResponse(coins),
      start,
      limit,
      total,
    });
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
