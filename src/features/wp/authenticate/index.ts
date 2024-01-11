import { tryber, unguess } from "@src/features/database";
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
  const isAdmin = await unguess.tables.WpUsermeta.do()
    .select()
    .where({
      user_id: userData.ID,
      meta_key: "wp_capabilities",
    })
    .andWhere("meta_value", "LIKE", "%administrator%")
    .first();

  const userField = await unguess.tables.WpUnguessUserToCustomer.do()
    .select(
      unguess
        .ref("tryber_wp_user_id")
        .withSchema("wp_unguess_user_to_customer"),
      unguess
        .ref("unguess_wp_user_id")
        .withSchema("wp_unguess_user_to_customer"),
      unguess.ref("profile_id").withSchema("wp_unguess_user_to_customer"),
      unguess.ref("user_email").withSchema("wp_users")
    )
    .join(
      "wp_users",
      "wp_users.ID",
      "=",
      "wp_unguess_user_to_customer.unguess_wp_user_id"
    )
    .where("wp_unguess_user_to_customer.unguess_wp_user_id", userData.ID)
    .first();

  if (userField) {
    // The user is a customer
    user.tryber_wp_user_id = userField.tryber_wp_user_id;
    user.profile_id = userField.profile_id;
    user.id = userField.tryber_wp_user_id; // user id is the same as tryber_wp_user_id
    user.unguess_wp_user_id = userField.unguess_wp_user_id;
    user.email = userField.user_email;
    user.role = isAdmin ? "administrator" : "customer";
  } else if (isAdmin) {
    const adminEmail = await unguess.tables.WpUsers.do()
      .select("user_email")
      .where({
        ID: userData.ID,
      })
      .first();

    if (adminEmail) {
      user.id = 0;
      user.email = adminEmail.user_email;
      user.unguess_wp_user_id = userData.ID;
      user.role = "administrator";

      return user;
    }
  }

  return user;
};
