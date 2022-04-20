import profiles from "../database/seed/profiles.json";

export default {
  verify: (token: string, secret: string) => {
    if (token === "customer") {
      return {
        ...profiles[0],
        role: "customer",
        tryber_wp_user_id: profiles[0].wp_user_id,
        profile_id: profiles[0].id,
      };
    }

    if (token === "administrator") {
      return {
        ...profiles[1],
        role: "administrator",
        tryber_wp_user_id: 0,
        profile_id: 0,
      };
    }

    if (token === "userWithLimitedPermissions") {
      return {
        ...profiles[2],
        role: "customer",
        tryber_wp_user_id: profiles[2].wp_user_id,
        profile_id: profiles[2].id,
      };
    }
  },
};
