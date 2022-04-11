import getProject from ".";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";

jest.mock("@src/features/db");
jest.mock("@appquality/wp-auth");

const admin_user_1 = {
  id: 3,
  user_login: "admin@unguess.io",
  user_pass: "password",
  email: "admin@unguess.io",
  role: "administrator",
  workspaces: {},
};

const customer_user_1 = {
  id: 1,
  user_login: "customer1@unguess.io",
  user_pass: "password",
  email: "customer1@unguess.io",
  role: "customer",
  workspaces: {},
};

const customer_user_2 = {
  id: 2,
  user_login: "customer1@unguess.io",
  user_pass: "password",
  email: "customer1@unguess.io",
  role: "customer",
  workspaces: {},
};

const customer_1 = {
  id: 1,
  company: "Company",
  company_logo: "logo.png",
  tokens: 100,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 1,
};

const user_to_customer_2 = {
  wp_user_id: 1,
  customer_id: 2,
};

const project_1 = {
  id: 1,
  display_name: "Projettino unoh",
  customer_id: 1,
};

const project_2 = {
  id: 2,
  display_name: "Projettino dueh",
  customer_id: 1,
};

const user_to_project_1 = {
  wp_user_id: 1,
  project_id: 1,
};

const user_to_project_2 = {
  wp_user_id: 1,
  project_id: 2,
};

const campaign_1 = {
  id: 1,
  start_date: "2020-01-01",
  end_date: "2020-01-02",
  close_date: "2020-01-03",
  title: "Campagna 1",
  customer_title: "Campagna 1",
  description: "Descrizione campagna 1",
  status_id: 1,
  is_public: 1,
  campaign_type_id: 1,
  project_id: 1,
  customer_id: 1,
};

describe("getProject", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.create();

        await dbAdapter.add({
          companies: [customer_1],
          campaigns: [campaign_1],
          projects: [project_1, project_2],
          userToProjects: [user_to_project_1, user_to_project_2],
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
        console.log(error);
        reject(error);
      }

      resolve(true);
    });
  });

  it("Should have projectId and workspaceId valid parameters", async () => {
    try {
      await getProject(0, 0, customer_user_1);
      fail("Should throw error");
    } catch (error) {
      expect((error as OpenapiError).message).toBe("Bad request");
    }
  });

  it("Should throw 'You have no permission' error on no results", async () => {
    try {
      await getProject(2, customer_1.id, customer_user_2);
      fail("Should throw error");
    } catch (error) {
      expect((error as OpenapiError).message).toBe("You have no permission");
    }
  });

  it("Should return a project because is an admin", async () => {
    try {
      await getProject(2, customer_1.id, admin_user_1);
    } catch (error) {
      expect((error as OpenapiError).message).toBe("You have no permission");
    }
  });

  it("Should throw 'You have no permission' error on no results for admins", async () => {
    try {
      await getProject(9999, customer_1.id, admin_user_1);
      fail("Should throw error");
    } catch (error) {
      expect((error as OpenapiError).message).toBe("No project found");
    }
  });

  it("Should throw 'No project found' error on no results for normal customers", async () => {
    try {
      await getProject(2, customer_1.id, customer_user_2);
      fail("Should throw error");
    } catch (error) {
      expect((error as OpenapiError).message).toBe("You have no permission");
    }
  });

  it("Should return a project because is an admin", async () => {
    try {
      const proj = await getProject(project_2.id, customer_1.id, admin_user_1);
      expect(JSON.stringify(proj)).toBe(
        JSON.stringify({ id: 2, name: "Projettino dueh", campaigns_count: 0 })
      );
    } catch (e) {
      console.log(e);
    }
  });

  it("Should throw 'You have no permission' error on no results for admins", async () => {
    try {
      await getProject(9999, customer_1.id, admin_user_1);
      fail("Should throw error");
    } catch (error) {
      expect((error as OpenapiError).message).toBe("No project found");
    }
  });

  it("Should throw 'No project found' error on no results for normal customers", async () => {
    try {
      await getProject(2, customer_1.id, customer_user_2);
      fail("Should throw error");
    } catch (error) {
      expect((error as OpenapiError).message).toBe("You have no permission");
    }
  });

  it("Should return a project because is an admin", async () => {
    try {
      const proj = await getProject(project_2.id, customer_1.id, admin_user_1);
      expect(JSON.stringify(proj)).toBe(
        JSON.stringify({ id: 2, name: "Projettino dueh", campaigns_count: 0 })
      );
    } catch (e) {
      console.log(e);
    }
  });

  it("Should throw 'No project found' error on no results for admins", async () => {
    try {
      await getProject(9999, customer_1.id, admin_user_1);
      fail("Should throw error");
    } catch (error) {
      expect((error as OpenapiError).message).toBe("No project found");
    }
  });

  it("Should throw 'No project found' error on no results for normal customers", async () => {
    try {
      await getProject(9999, customer_1.id, customer_user_1);
      fail("Should throw error");
    } catch (error) {
      expect((error as OpenapiError).message).toBe("No project found");
    }
  });

  it("Should return a project", async () => {
    try {
      let project = await getProject(
        project_1.id,
        customer_1.id,
        customer_user_1
      );
      expect(JSON.stringify(project)).toBe(
        JSON.stringify({
          id: project_1.id,
          name: project_1.display_name,
          campaigns_count: 1,
        })
      );
    } catch (error) {
      console.error(error);
    }
  });
});
