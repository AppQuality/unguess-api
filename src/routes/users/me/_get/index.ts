/** OPENAPI-ROUTE: get-users-me */
import { Context } from "openapi-backend";
import * as db from "../../../../features/db";

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let user = req.user;

  console.log(user);

  res.status_code = 200;

  if (user.profile_id) {
    try {
      // Get customer name from appq_evd_profile
      const profileSql = "SELECT * FROM wp_appq_evd_profile WHERE id = ?";
      let profile = await db.query(
        db.format(profileSql, [user.profile_id]),
        "tryber"
      );

      profile = profile[0];

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        profile_id: user.profile_id,
        tryber_wp_user_id: user.tryber_wp_user_id,
        name: profile.name + " " + profile.surname,
      };
    } catch (error) {
      console.error(error);
    }
  } else {
    // Is admin, so name is hardcoded
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: "Name Surname",
    };
  }
};
