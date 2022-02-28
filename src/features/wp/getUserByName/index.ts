import * as db from '../../db';

export default async (userName: string) => {
  const sql = `SELECT p.id as testerId, wp.ID,wp.user_login,wp.user_pass
  FROM wp_users wp
  JOIN wp_appq_evd_profile p ON wp.ID = p.wp_user_id 
  WHERE user_login = ?`;
  try {
    const results = await db.query(db.format(sql, [userName]));
    return results[0];
  } catch (e) {
    return Error("No user with name " + userName);
  }
};
