import * as db from "@src/features/db";

export default async (userData: {
  ID: number;
  user_login: string;
  user_pass: string;
  email: string;
}): Promise<UserType> => {
  let user: UserType = {
    ...userData,
    role: "customer",
    id: 0,
    workspaces: [],
    tryber_wp_user_id: 0,
    unguess_wp_user_id: 0,
    profile_id: 0,
  };

  // Check capabilities
  const isAdminSql =
    "SELECT * FROM wp_usermeta WHERE meta_key = 'wp_capabilities' AND meta_value LIKE '%administrator%' AND user_id = ?";
  let isAdminResult = await db.query(
    db.format(isAdminSql, [userData.ID]),
    "unguess"
  );

  if (isAdminResult.length) {
    user.role = "administrator";

    const adminInfo = await db.query(
      db.format("SELECT user_email FROM wp_users WHERE ID = ?", [userData.ID]),
      "unguess"
    );

    if (adminInfo) {
      user.id = 0;
      user.email = adminInfo[0].user_email;
      user.unguess_wp_user_id = userData.ID;

      return user;
    }
  }

  // Check customer info
  const customerInfoSql =
    "SELECT u.user_email, u.user_login, utc.* FROM wp_unguess_user_to_customer utc JOIN wp_users u ON (u.ID = utc.unguess_wp_user_id) WHERE utc.unguess_wp_user_id = ?";
  let customerInfoResult = await db.query(
    db.format(customerInfoSql, [userData.ID]),
    "unguess"
  );

  if (customerInfoResult.length) {
    let result = customerInfoResult[0];

    // The user is a customer
    user.tryber_wp_user_id = result.tryber_wp_user_id;
    user.profile_id = result.profile_id;
    user.id = result.tryber_wp_user_id; // user id is the same as tryber_wp_user_id
    user.unguess_wp_user_id = result.unguess_wp_user_id;
    user.email = result.user_email;
  }

  return user;
};
