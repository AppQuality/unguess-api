import * as db from "../../db";

export default async (userName: string) => {
  const sql = `SELECT u.ID, u.user_login, u.user_pass, u.user_email
    FROM wp_users u
    WHERE u.user_login = ?`;
  try {
    const results = await db.query(db.format(sql, [userName]), "unguess");
    if (results.length) {
      return results[0];
    }
    return false;
  } catch (e) {
    return Error("No user with name " + userName);
  }
};
