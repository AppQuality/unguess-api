import { ERROR_MESSAGE } from "@src/utils/constants";

/**
 * Get total coins from a list of coins' packages
 *
 *
 * @param coinPackages (Array)
 * @returns number of total coins
 */
export const getTotalCoins = async (
  coinPackages: StoplightComponents["schemas"]["Coin"][]
): Promise<number> => {
  let error = {
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Check parameters
  if (!coinPackages) throw { ...error, code: 400 };

  // Sum packages amounts
  let totalCoins = 0;

  coinPackages.forEach(
    (coinPackage: StoplightComponents["schemas"]["Coin"]) => {
      totalCoins += coinPackage.amount;
    }
  );

  return totalCoins;
};
