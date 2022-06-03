import { ERROR_MESSAGE } from "@src/utils/constants";
import * as db from "@src/features/db";

export default async (userName: string) => {
  let error = {
    error: true,
    message: ERROR_MESSAGE,
  } as StoplightComponents["schemas"]["Error"];

  const sql = `SELECT u.ID, u.user_login, u.user_pass, u.user_email
    FROM wp_users u
    WHERE u.user_login = ?`;

  const results = await db.query(db.format(sql, [userName]), "unguess");
  if (results.length) {
    return results[0];
  }

  throw { ...error, code: 403 };
};
