import * as db from "@src/features/db";
import { ERROR_MESSAGE, LIMIT_QUERY_PARAM_DEFAULT } from "@src/utils/constants";

interface GetWorkspacesCoinsArgs {
  workspaceId?: number;
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
export const getWorkspaceCoins = async ({
  workspaceId,
  limit,
  start,
  orderBy,
  order,
}: GetWorkspacesCoinsArgs): Promise<
  StoplightComponents["schemas"]["Coin"][]
> => {
  let error = {
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Check parameters
  if (workspaceId == null || workspaceId <= 0) throw { ...error, code: 400 };

  // Retrieve coins packages

  let query = "SELECT * FROM wp_ug_coins WHERE customer_id = ? AND amount > 0";

  if (order && orderBy) {
    query += ` ORDER BY ${orderBy} ${order}`;
  }

  if (limit || start) {
    query += ` LIMIT ${limit || 10} OFFSET ${start || 0}`;
  }

  const coinsQuery = db.format(query, [workspaceId]);
  let packages = await db.query(coinsQuery, "unguess");

  return packages.length ? packages : [];
};
