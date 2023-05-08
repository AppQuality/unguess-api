import { ERROR_MESSAGE } from "@src/utils/constants";
import { tryber } from "@src/features/database";

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

  const profile = await tryber.tables.WpAppqEvdProfile.do()
    .insert({
      wp_user_id: tryber_wp_id,
      name,
      surname,
      email,
      blacklisted: 1,
      employment_id: -1,
      education_id: -1,
    })
    .returning("id");

  if (profile) {
    const profile_id = profile[0].id ?? profile[0];
    return {
      tryber_wp_id,
      profile_id,
    };
  }

  throw { ...error, code: 403 };
};
