import { ERROR_MESSAGE } from "@src/utils/constants";
import * as db from "@src/features/db";

interface GetWorkspaceHistoryCoinsArgs {
  workspaceId: number;
  campaignId?: number;
  coinsPackageId?: number;
}

type CoinTransaction = {
  id: number;
  customer_id: number;
  profile_id: number;
  quantity: number;
  campaign_id: number;
  coins_package_id: number;
  created_on: string;
  notes: string;
};

/**
 * Get coins transaction for a workspace
 *
 * Notes: we don't check if the user has permission to get the workspace, because this is done in the getWorkspace function
 *
 * @param workspaceId (number) - workspace id
 * @param campaignId? (number) - campaign id to search for
 * @param coinsPackageId? (number) - coins package id to search for
 * @returns an array of coins (Array<CoinTransaction>) or false on failure
 */
export const getWorkspaceCoinsTransactions = async ({
  workspaceId,
  campaignId,
  coinsPackageId,
}: GetWorkspaceHistoryCoinsArgs): Promise<Array<CoinTransaction> | false> => {
  let error = {
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Check parameters
  if (workspaceId == null || workspaceId <= 0) throw { ...error, code: 400 };

  // Get transactions
  let sql = `SELECT * FROM wp_ug_coins_transactions WHERE customer_id = ?`;

  if (campaignId != null) {
    sql += ` AND campaign_id = ?`;
  }

  if (coinsPackageId != null) {
    sql += ` AND coins_package_id = ?`;
  }

  const params = [workspaceId];

  if (campaignId != null) {
    params.push(campaignId);
  }

  if (coinsPackageId != null) {
    params.push(coinsPackageId);
  }

  const query = db.format(sql, params);

  try {
    const transactions = await db.query(query, "unguess");

    return transactions;
  } catch (error) {
    console.error(error);
    return false;
  }
};
