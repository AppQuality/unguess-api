import { ERROR_MESSAGE } from "@src/utils/constants";
import * as db from "@src/features/db";

interface GetExpressCostArgs {
  slug: string;
}

/**
 * Get express cost for a workspace
 *
 * @param slug (string) - slug of the express to check
 * @returns the cost of the express (number) or false on failure
 */
export const getExpressCost = async ({
  slug,
}: GetExpressCostArgs): Promise<number | false> => {
  let error = {
    message: ERROR_MESSAGE,
    error: true,
  } as StoplightComponents["schemas"]["Error"];

  // Check parameters
  if (slug == null || !slug || slug == "") throw { ...error, code: 400 };

  // Get transactions
  let sql = `SELECT * FROM wp_ug_express WHERE slug = ?`;

  const params = [slug];

  const query = db.format(sql, params);

  try {
    let express = await db.query(query, "unguess");

    express = express[0];

    if (!express) return false;

    if (!express.cost) return 0;

    return express.cost;
  } catch (error) {
    console.error(error);
    return false;
  }
};
