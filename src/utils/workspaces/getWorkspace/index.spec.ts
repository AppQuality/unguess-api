import { getWorkspace } from "@src/utils/workspaces";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { ERROR_MESSAGE, fallBackCsmProfile } from "@src/utils/constants";

const admin_user_1 = {
  id: 3,
  user_login: "admin@unguess.io",
  user_pass: "password",
  email: "admin@unguess.io",
  role: "administrator",
  tryber_wp_user_id: 0,
  unguess_wp_user_id: 12,
  profile_id: 0,
  workspaces: {},
};

const customer_user_1 = {
  id: 1,
  user_login: "customer1@unguess.io",
  user_pass: "password",
  email: "customer1@unguess.io",
  role: "customer",
  tryber_wp_user_id: 1,
  unguess_wp_user_id: 1,
  profile_id: 1,
  workspaces: {},
};

const customer_user_2 = {
  id: 2,
  user_login: "customer2@unguess.io",
  user_pass: "password",
  email: "customer2@unguess.io",
  role: "customer",
  tryber_wp_user_id: 2,
  unguess_wp_user_id: 12,
  profile_id: 2,
  workspaces: {},
};

const customer_1 = {
  id: 1,
  company: "Company",
  company_logo: "logo.png",
  tokens: 100,
};

const customer_2 = {
  id: 2,
  company: "Company",
  company_logo: "logo.png",
  tokens: 100,
};

const customer_3 = {
  id: 3,
  company: "Company",
  company_logo: "logo.png",
  tokens: 100,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 1,
};

const user_to_customer_2 = {
  wp_user_id: 2,
  customer_id: 2,
};

const user_to_customer_3 = {
  wp_user_id: 1,
  customer_id: 3,
};

const coins_package_1 = {
  customer_id: 3,
  amount: 10,
};

describe("getWorkspace", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.add({
          companies: [customer_1, customer_2, customer_3],
          userToCustomers: [
            user_to_customer_1,
            user_to_customer_2,
            user_to_customer_3,
          ],
          coins: [coins_package_1],
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  it("Should return error because workspace id is 0", async () => {
    try {
      await getWorkspace({
        workspaceId: 0,
        user: customer_user_1,
      });
    } catch (error: any) {
      expect(error.code).toBe(400);
      expect(error.message).toBe(ERROR_MESSAGE + " with workspace");
    }
  });

  it("Should return error 403 because the user has no permission", async () => {
    try {
      await getWorkspace({
        workspaceId: 1,
        user: customer_user_2,
      });
    } catch (error: any) {
      expect(error.code).toBe(403);
      expect(error.message).toBe("workspace issue");
    }
  });

  it("Should return any workspace if user is administrator", async () => {
    let workspace = await getWorkspace({
      workspaceId: 1,
      user: admin_user_1,
    });
    expect(workspace).toMatchObject({
      id: customer_1.id,
      company: customer_1.company,
      logo: customer_1.company_logo,
      tokens: customer_1.tokens,
    });
  });

  it("Should return 403 error if the workspace is not found", async () => {
    try {
      await getWorkspace({
        workspaceId: 999,
        user: customer_user_1,
      });
    } catch (error: any) {
      expect(error.code).toBe(403);
      expect(error.message).toBe("generic workspace error");
    }
  });

  it("Should have all the required fields", async () => {
    const workspace = (await getWorkspace({
      workspaceId: 1,
      user: customer_user_1,
    })) as Workspace;
    expect(workspace).toHaveProperty("company");
    expect(workspace).toHaveProperty("id");
    expect(workspace).toHaveProperty("tokens");
  });

  it("Should have all the types matching the requirements", async () => {
    const workspace = (await getWorkspace({
      workspaceId: 1,
      user: customer_user_1,
    })) as Workspace;
    const { company, id, tokens, logo } = workspace;
    expect(typeof company).toBe("string");
    expect(typeof tokens).toBe("number");
    expect(typeof id).toBe("number");
    expect(typeof logo).toBe("string");
  });

  it("Should return a workspace", async () => {
    let workspace = await getWorkspace({
      workspaceId: 1,
      user: customer_user_1,
    });
    expect(workspace).toMatchObject({
      id: customer_1.id,
      company: customer_1.company,
      tokens: customer_1.tokens,
      logo: customer_1.company_logo,
      csm: fallBackCsmProfile,
      coins: 0,
    });
  });

  it("Should return a workspace with coins if customer has any", async () => {
    let workspace = await getWorkspace({
      workspaceId: customer_3.id,
      user: customer_user_1,
    });
    expect(workspace).toEqual(
      expect.objectContaining({
        id: customer_3.id,
        coins: coins_package_1.amount,
      })
    );
  });
});
