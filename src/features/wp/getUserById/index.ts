import * as db from '../../db';

export default async (userId: number) => {
  const sql = `SELECT u.ID, u.user_login, u.user_pass, u.user_email
    FROM wp_users u
    WHERE u.ID = ?`;
  try {
    const results = await db.query(db.format(sql, [userId]), "unguess");
    return results[0];
  } catch (e) {
    return Error("No user with id " + userId);
  }
};
