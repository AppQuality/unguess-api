export default {
  verify: (token: string, secret: string) => {
    if (token === "customer") {
      return {
        id: 1,
        email: "customer@email.com",
        role: "customer",
        tryber_wp_user_id: 1,
        profile_id: 1,
      };
    }

    if (token === "administrator") {
      return {
        id: 2,
        email: "administrator@email.com",
        role: "administrator",
      };
    }
  },
};
