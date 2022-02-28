import * as db from '../../db';

export default async (userId: number) => {
  const sql = `SELECT p.id as testerId, wp.ID,wp.user_login,wp.user_pass
  FROM wp_users wp
  JOIN wp_appq_evd_profile p ON wp.ID = p.wp_user_id 
    WHERE ID = ?`;
  try {
    const results = await db.query(db.format(sql, [userId]));
    return results[0];
  } catch (e) {
    return Error("No user with id " + userId);
  }
};
