import * as db from "@src/features/db";
import { ERROR_MESSAGE } from "@src/utils/constants";

interface GetWorkspacesCoinsArgs {
  workspaceId?: number;
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
  const coins = db.format(
    `SELECT * FROM wp_ug_coins
      WHERE customer_id = ?`,
    [workspaceId]
  );

  let packages = await db.query(coins);

  return packages.length ? packages : [];
};
