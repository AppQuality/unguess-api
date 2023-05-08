import { HashPassword } from "wordpress-hash-node";
import * as db from "@src/features/db";
import { tryber } from "@src/features/database";

const createTryberWPUser = async (
  user_login: string,
  email: string,
  psw: string
): Promise<number> => {
  const alreadyRegisteredUser = await tryber.tables.WpUsers.do()
    .select("ID")
    .where({ user_login });

  if (alreadyRegisteredUser.length) {
    const random = Math.random().toString(36).substring(7);
    return await createTryberWPUser(`${user_login}-${random}`, email, psw);
  }

  try {
    const alreadyRegisteredEmail = await tryber.tables.WpUsers.do()
      .select("*")
      .where({ user_email: email });

    if (alreadyRegisteredEmail.length) {
      throw Error(`Email ${email} already registered`);
    }
  } catch (e) {
    throw e;
  }

  const hash = HashPassword(psw);

  try {
    const wp_user = await tryber.tables.WpUsers.do()
      .insert({
        user_email: email,
        user_nicename: user_login.substring(0, 50),
        display_name: user_login,
        user_login,
        user_pass: hash,
        user_registered: new Date().toISOString().substring(0, 10),
      })
      .returning("ID");

    return wp_user[0].ID ?? wp_user[0];
  } catch (e) {
    throw e;
  }
};

export default createTryberWPUser;
