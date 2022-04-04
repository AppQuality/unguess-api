import profiles from "@src/__mocks__/database/seed/profiles.json";

export default {
  verify: (token: string, secret: string) => {
    if (token === "customer") {
      return {
        ...profiles[0],
      };
    }

    if (token === "administrator") {
      return {
        ...profiles[1],
      };
    }

    if (token === "userWithLimitedPermissions") {
      return {
        ...profiles[2],
      };
    }
  },
};
