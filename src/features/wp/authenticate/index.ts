import * as db from "../../db";

export default async (userData: {
  id: number;
  user_login: string;
  user_pass: string;
  email: string;
}): Promise<UserType | Error> => {
  let user: UserType = {
    ...userData,
    role: "customer",
  };

  try {
    // Check capabilities
    const isAdminSql =
      "SELECT * FROM wp_usermeta WHERE meta_key = 'wp_capabilities' AND meta_value LIKE '%administrator%' AND user_id = ?";
    let isAdminResult = await db.query(
      db.format(isAdminSql, [userData.id]),
      "unguess"
    );
    if (isAdminResult.length) {
      user.role = "administrator";
    }

    // Check customer info
    const customerInfoSql =
      "SELECT * FROM wp_unguess_user_to_customer WHERE unguess_wp_user_id = ?";
    let customerInfoResult = await db.query(
      db.format(customerInfoSql, [userData.id]),
      "unguess"
    );
    if (customerInfoResult.length) {
      let result = customerInfoResult[0];
      // The user is a customer
      user.tryber_wp_user_id = result.tryber_wp_user_id;
      user.profile_id = result.profile_id;
      user.tryber_wp_user_id;
      user.profile_id;
    }
  } catch (e) {
    console.error(e);
    return e as Error;
  }

  return user;
};
