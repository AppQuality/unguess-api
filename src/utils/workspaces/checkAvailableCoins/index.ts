import { DEFAULT_EXPRESS_COST } from "@src/utils/constants";

interface CheckAvailableCoinsArgs {
  coins: StoplightComponents["schemas"]["Workspace"]["coins"];
  cost?: number;
}

/**
 * Check if a coins amount is enough to cover a certain amount of coins required (cost)
 *
 *
 * @param coins (StoplightComponents["schemas"]["Workspace"]["coins"]) - coins amount to check
 * @param cost? (number) default: 1 - amount of coins required
 * @returns true | false (boolean)
 */
export const checkAvailableCoins = ({
  coins,
  cost = DEFAULT_EXPRESS_COST,
}: CheckAvailableCoinsArgs): boolean => {
  if (!coins) coins = 0; // If no coins are available, assume there are no coins

  return coins >= cost ? true : false;
};
