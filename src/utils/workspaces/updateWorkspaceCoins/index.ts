import { DEFAULT_EXPRESS_COST, ERROR_MESSAGE } from "@src/utils/constants";
import { getWorkspaceCoins } from "../getWorkspaceCoins";
import * as db from "@src/features/db";
import { getTotalCoins } from "../getTotalCoins";

interface UpdateWorkspaceCoinsArgs {
  workspaceId?: number;
  cost?: number;
}

/**
 * Update coins amount for a workspace
 *
 * Notes: we don't check if the user has permission to get the workspace, because this is done in the getWorkspace function
 *
 * @param workspaceId (number) - workspace id
 * @param cost? (number) default: 1 - amount of coins required
 * @returns array of updated coins (Array)
 */
export const updateWorkspaceCoins = async ({
  workspaceId,
  cost = DEFAULT_EXPRESS_COST,
}: UpdateWorkspaceCoinsArgs): Promise<
  StoplightComponents["schemas"]["Coin"][]
> => {
  let error = {
    message: ERROR_MESSAGE + " with workspace coins",
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Check parameters
  if (workspaceId == null || workspaceId <= 0) throw { ...error, code: 400 };

  // Retrieve coins packages
  const oldPackages = await getWorkspaceCoins({
    workspaceId,
    orderBy: "created_on",
    order: "ASC",
  });

  // Check if no packages are available
  if (!oldPackages.length) {
    throw { ...error, code: 400 };
  }

  // Double check if at least one package has enough coins amount in case of cost != 1 (already filtered in getWorkspaceCoins)
  if ((await getTotalCoins(oldPackages)) < cost) {
    throw { ...error, code: 400 };
  }

  // Update packages starting from the oldest one
  let sql =
    "UPDATE wp_ug_coins SET amount = ?, updated_on = CURRENT_TIMESTAMP WHERE id = ?";
  let remainingCost = cost;
  oldPackages.map(async (package_) => {
    if (remainingCost === 0) return package_;

    if (package_.amount >= cost) {
      const newAmount = package_.amount - remainingCost;
      remainingCost = 0;

      // Execute transaction
      const coinsQuery = db.format(sql, [newAmount, package_.id]);
      await db.query(coinsQuery, "unguess");

      return {
        ...package_,
        amount: newAmount,
      };
    } else {
      remainingCost -= package_.amount;

      // Execute transaction
      const coinsQuery = db.format(sql, [0, package_.id]);
      await db.query(coinsQuery, "unguess");

      return {
        ...package_,
        amount: 0,
      };
    }
  });

  // Retrieve new coins packages
  const newPackages = await getWorkspaceCoins({
    workspaceId,
    orderBy: "updated_on",
    order: "DESC",
  });

  return newPackages;
};
