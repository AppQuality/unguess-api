export default {
  verify: (token: string, secret: string) => {
    if (token === "customer") {
      return {
        ID: 2,
        user_email: "customer@email.com",
        role: "customer",
        tryber_wp_user_id: 123,
        profile_id: 321,
      };
    }

    if (token === "administrator") {
      return {
        ID: 1,
        user_email: "administrator@email.com",
        role: "administrator",
        tryber_wp_user_id: 0,
        profile_id: 0,
      };
    }
  },
};
