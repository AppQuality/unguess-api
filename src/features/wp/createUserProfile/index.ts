import { ERROR_MESSAGE } from "@src/utils/constants";
import * as db from "@src/features/db";

export interface ICreateUserProfileArgs {
  tryber_wp_id: number;
  email: string;
  name?: string;
  surname?: string;
}

export default async ({
  tryber_wp_id,
  email,
  name = "",
  surname = "",
}: {
  tryber_wp_id: number;
  email: string;
  name?: string;
  surname?: string;
}): Promise<{
  tryber_wp_id: number;
  profile_id: number;
}> => {
  let error = {
    error: true,
    message: ERROR_MESSAGE,
  } as StoplightComponents["schemas"]["Error"];

  const profile = await db.query(
    db.format(
      `INSERT INTO 
        wp_appq_evd_profile 
        (wp_user_id, name, surname, email, blacklisted, employment_id, education_id) 
        VALUES (?, ?, ?, ?, 1, -1, -1)`,
      [tryber_wp_id, name, surname, email]
    )
  );

  if (profile) {
    const profile_id = profile.insertId ?? profile.lastInsertRowid;
    return {
      tryber_wp_id,
      profile_id,
    };
  }

  throw { ...error, code: 403 };
};
