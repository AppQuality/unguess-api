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
  const error = {
    message: ERROR_MESSAGE + " with workspace coins",
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Check parameters
  if (workspaceId == null || workspaceId <= 0) throw { ...error, code: 400 };

  // Retrieve coins packages
  const packages = await getWorkspaceCoins({
    workspaceId,
    orderBy: "created_on",
    order: "ASC",
  });

  // Check if no packages are available
  if (!packages.length) throw { ...error, code: 400 };

  if (cost === 0) return [];

  // Double check if at least one package has enough coins amount in case of cost != 1 (already filtered in getWorkspaceCoins)
  const totalCoins = packages.reduce((acc, pack) => acc + pack.amount, 0);
  if (totalCoins < cost) throw { ...error, code: 400 };

  // Update packages starting from the oldest one
  let remainingCost = cost;
  const updatedPackages = [];

  for (const pack of packages) {
    const newAmount =
      pack.amount - remainingCost > 0 ? pack.amount - remainingCost : 0;
    remainingCost =
      remainingCost - pack.amount > 0 ? remainingCost - pack.amount : 0;

    await db.query(
      db.format(
        `UPDATE wp_ug_coins
        SET amount = ?, updated_on = CURRENT_TIMESTAMP 
        WHERE id = ?`,
        [newAmount, pack.id]
      ),
      "unguess"
    );

    updatedPackages.push({
      ...pack,
      amount: newAmount,
    });

    if (remainingCost === 0) break;
  }

  return updatedPackages;
};
