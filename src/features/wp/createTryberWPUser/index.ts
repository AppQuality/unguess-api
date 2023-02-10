import { HashPassword } from "wordpress-hash-node";
import * as db from "@src/features/db";

const createTryberWPUser = async (
  user_login: string,
  email: string,
  psw: string
): Promise<number> => {
  let sql = `SELECT * FROM wp_users WHERE user_login = ?`;
  let alreadyRegisteredUser;
  try {
    alreadyRegisteredUser = await db.query(db.format(sql, [user_login]));
  } catch (e) {
    throw e;
  }
  if (alreadyRegisteredUser.length) {
    const random = Math.random().toString(36).substring(7);
    return await createTryberWPUser(`${user_login}-${random}`, email, psw);
  }

  sql = `SELECT * FROM wp_users WHERE user_email = ?`;
  try {
    const alreadyRegisteredEmail = await db.query(db.format(sql, [email]));

    if (alreadyRegisteredEmail.length) {
      throw Error(`Email ${email} already registered`);
    }
  } catch (e) {
    throw e;
  }

  const hash = HashPassword(psw);

  try {
    const results = await db.query(
      db.format(
        `INSERT INTO wp_users 
    (user_email, user_nicename, display_name, user_login, user_pass, user_registered) 
    VALUES (?, ?, ?, ?, ?, ?)`,
        [
          email,
          user_login.substring(0, 50),
          user_login,
          user_login,
          hash,
          new Date().toISOString().substring(0, 10),
        ]
      )
    );

    return results?.insertId || results.lastInsertRowid;
  } catch (e) {
    throw e;
  }
};

export default createTryberWPUser;