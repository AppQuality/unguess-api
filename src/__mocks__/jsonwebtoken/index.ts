import profiles from "@src/__mocks__/database/seed/profiles.json";

export default {
  verify: (token: string, secret: string) => {
    if (token === "user") {
      return {
        ...profiles[0],
        role: "customer",
        tryber_wp_user_id: profiles[0].wp_user_id,
        unguess_wp_user_id: profiles[0].wp_user_id,
        profile_id: profiles[0].id,
      };
    }

    if (token === "admin") {
      return {
        ...profiles[1],
        role: "administrator",
        tryber_wp_user_id: 0,
        unguess_wp_user_id: 0,
        profile_id: 0,
      };
    }

    if (token === "userWithLimitedPermissions") {
      return {
        ...profiles[2],
        id: profiles[2].wp_user_id,
        role: "customer",
        tryber_wp_user_id: profiles[2].wp_user_id,
        unguess_wp_user_id: profiles[2].wp_user_id,
        profile_id: profiles[2].id,
      };
    }
  },
};
