import { ERROR_MESSAGE } from "@src/utils/constants";
import * as db from "@src/features/db";

interface UpdateWorkspaceHistoryCoinsArgs {
  workspaceId: number;
  profileId: number;
  quantity: number;
  campaignId: number;
  coinsPackageId: number;
  notes?: string;
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
 * Update coins transaction history for a workspace
 *
 * Notes: we don't check if the user has permission to get the workspace, because this is done in the getWorkspace function
 *
 * @param workspaceId (number) - workspace id
 * @param cost? (number) default: 1 - amount of coins required
 * @param campaignId? (number) - campaign id
 * @returns array of updated coins (Array)
 */
export const updateWorkspaceCoinsTransaction = async ({
  workspaceId,
  profileId,
  quantity,
  campaignId,
  coinsPackageId,
  notes,
}: UpdateWorkspaceHistoryCoinsArgs): Promise<CoinTransaction | false> => {
  let error = {
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Check parameters
  if (workspaceId == null || workspaceId <= 0) throw { ...error, code: 400 };

  if (profileId == null || profileId <= 0) throw { ...error, code: 400 };

  if (quantity == null || quantity <= 0) throw { ...error, code: 400 };

  if (campaignId == null || campaignId <= 0) throw { ...error, code: 400 };

  if (coinsPackageId == null || coinsPackageId <= 0)
    throw { ...error, code: 400 };

  // Insert transaction history
  const sql =
    "INSERT INTO wp_ug_coins_transactions (customer_id, profile_id, quantity, campaign_id, coins_package_id, notes, created_on) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";

  const coinsQuery = db.format(sql, [
    workspaceId,
    profileId,
    quantity,
    campaignId,
    coinsPackageId,
    notes || "",
  ]);

  try {
    const result = await db.query(coinsQuery, "unguess");
    let transaction_id;
    if (result.insertId) {
      // MySql
      transaction_id = result.insertId;
    } else if (result.lastInsertRowid) {
      // Sqlite
      transaction_id = result.lastInsertRowid;
    }

    // Get transaction details
    const sql = "SELECT * FROM wp_ug_coins_transactions WHERE id = ?";
    const transactionQuery = db.format(sql, [transaction_id]);
    const transaction = await db.query(transactionQuery, "unguess");

    if (transaction.length > 0) {
      return transaction[0];
    }

    return false;
  } catch (error) {
    console.error(error);
    return false;
  }

  return false;
};
