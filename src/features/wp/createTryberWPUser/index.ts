import { HashPassword } from "wordpress-hash-node";

import * as db from "@src/features/db";

const createTryberWPUser = async (
  username: string,
  email: string,
  password: string
): Promise<number> => {
  let sql = `SELECT * FROM wp_users WHERE user_login = ?`;
  let alreadyRegisteredUser;
  try {
    alreadyRegisteredUser = await db.query(db.format(sql, [username]));
  } catch (e) {
    throw e;
  }
  if (alreadyRegisteredUser.length) {
    const random = Math.random().toString(36).substring(7);
    return await createTryberWPUser(`${username}-${random}`, email, password);
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

  const hash = HashPassword(password);

  try {
    const results = await db.query(
      db.format(
        `INSERT INTO wp_users 
    (user_email, user_nicename, display_name, user_login, user_pass, user_registered) 
    VALUES (?, ?, ?, ?, ?, ?)`,
        [
          email,
          username.substring(0, 50),
          username,
          username,
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
