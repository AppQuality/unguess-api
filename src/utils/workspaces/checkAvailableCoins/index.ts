import { ERROR_MESSAGE } from "@src/utils/constants";

/**
 * Check if a workspace has got enough coins to cover a certain amount of coins required (price)
 *
 *
 * @param workspace (Workspace) - workspace to check
 * @param price? (number) default: 1 - amount of coins required
 * @returns true | false (boolean)
 */
export const checkAvailableCoins = async (
  workspace: StoplightComponents["schemas"]["Workspace"],
  price: number = 1
): Promise<boolean> => {
  let error = {
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Check parameters
  if (!workspace) throw { ...error, code: 400 };

  if (!workspace.coins) return false;

  return workspace.coins >= price ? true : false;
};
