import getWorkspace from ".";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { ERROR_MESSAGE } from "@src/routes/shared";

jest.mock("@src/features/db");
jest.mock("@appquality/wp-auth");

const admin_user_1 = {
  id: 3,
  user_login: "admin@unguess.io",
  user_pass: "password",
  email: "admin@unguess.io",
  role: "administrator",
  tryber_wp_user_id: 0,
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

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 1,
};

const user_to_customer_2 = {
  wp_user_id: 2,
  customer_id: 2,
};

describe("getWorkspace", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.create();

        await dbAdapter.add({
          companies: [customer_1, customer_2],
          userToCustomers: [user_to_customer_1, user_to_customer_2],
        });
      } catch (error) {
        console.log(error);
        reject(error);
      }

      resolve(true);
    });
  });

  afterAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.drop();
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  it("Should return error because workspace id is 0", async () => {
    try {
      const response = (await getWorkspace(
        0,
        customer_user_1
      )) as StoplightComponents["schemas"]["Error"];
      expect(response.code).toBe(400);
      expect(response.message).toBe(ERROR_MESSAGE);
    } catch (error) {
      console.log(error);
    }
  });

  it("Should return error 403 because the use has no permission", async () => {
    try {
      const response = (await getWorkspace(
        1,
        customer_user_2
      )) as StoplightComponents["schemas"]["Error"];
      expect(JSON.stringify(response)).toBe(
        JSON.stringify({
          message: ERROR_MESSAGE,
          error: true,
          code: 403,
        })
      );
    } catch (error) {
      console.log(error);
    }
  });

  it("Should return any workspace if user is administrator", async () => {
    let workspace = await getWorkspace(1, admin_user_1);
    expect(workspace).toMatchObject({
      id: customer_1.id,
      company: customer_1.company,
      logo: customer_1.company_logo,
      tokens: customer_1.tokens,
    });
  });

  it("Should return 404 error if the workspace is not found", async () => {
    try {
      const response = await getWorkspace(9999, customer_user_1);
      expect(JSON.stringify(response)).toBe(
        JSON.stringify({
          message: ERROR_MESSAGE,
          error: true,
          code: 404,
        })
      );
    } catch (error) {
      expect((error as OpenapiError).message).toBe("No workspace found");
    }
  });

  it("Should have all the required fields", async () => {
    const workspace = (await getWorkspace(1, customer_user_1)) as Workspace;
    expect(workspace).toHaveProperty("company");
    expect(workspace).toHaveProperty("id");
    expect(workspace).toHaveProperty("tokens");
  });

  it("Should have all the types matching the requirements", async () => {
    const workspace = (await getWorkspace(1, customer_user_1)) as Workspace;
    const { company, id, tokens, logo } = workspace;
    expect(typeof company).toBe("string");
    expect(typeof tokens).toBe("number");
    expect(typeof id).toBe("number");
    expect(typeof logo).toBe("string");
  });

  it("Should return a workspace", async () => {
    let workspace = await getWorkspace(1, customer_user_1);
    expect(JSON.stringify(workspace)).toBe(
      JSON.stringify({
        id: customer_1.id,
        company: customer_1.company,
        tokens: customer_1.tokens,
        logo: customer_1.company_logo,
        csm: {
          id: 20739,
          name: "Gianluca",
          surname: "Peretti",
          email: "gianluca.peretti@unguess.io",
          role: "admin",
          tryber_wp_user_id: 20739,
          profile_id: 21605,
          workspaces: [],
        },
      })
    );
  });
});
