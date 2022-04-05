import app from "@src/app";
import request from "supertest";
import getWorkspace from "../../getWorkspace";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";

jest.mock("@src/features/db");
jest.mock("@appquality/wp-auth");

const customer_profile_1 = {
  id: 1,
  wp_user_id: 1,
  name: "Customer",
  surname: "Customer",
  email: "customer@unguess.io",
};

const customer_1 = {
  id: 1,
  company: "Company 1",
  company_logo: "logo1.png",
  tokens: 100,
};

const customer_2 = {
  id: 2,
  company: "Company 2",
  company_logo: "logo2.png",
  tokens: 200,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 1,
};

const user_to_customer_2 = {
  wp_user_id: 1,
  customer_id: 2,
};

const user_to_project = {
  wp_user_id: 2,
  project_id: 1,
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

describe("GET /workspaces/{wid}/projects", () => {
  beforeAll(async () => {
    return new Promise(async (resolve) => {
      try {
        await dbAdapter.create();

        await dbAdapter.add({
          profiles: [customer_profile_1],
          companies: [customer_1, customer_2],
          projects: [project_1, project_2],
          userToCustomers: [user_to_customer_1, user_to_customer_2],
          userToProjects: [user_to_project],
        });
      } catch (error) {
        console.log(error);
      }

      resolve(true);
    });
  });

  afterAll(async () => {
    return new Promise(async (resolve) => {
      try {
        await dbAdapter.drop();
      } catch (error) {
        console.log(error);
      }

      resolve(true);
    });
  });

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).get("/workspaces");
    expect(response.status).toBe(403);
  });

  it("Should answer 200 if logged in", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}/projects`)
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
  });

  it("Should answer 200 with only the visible projects", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}/projects`)
      .set("authorization", "Bearer customer");
    expect(response.body).toMatchObject([
      {
        id: project_2.id,
        display_name: project_2.display_name,
        campaigns_count: 0,
      },
    ]);
  });

  it("Should answer 400 if wid is a string", async () => {
    const response = await request(app)
      .get(`/workspaces/asd/projects`)
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(400);
  });

  it("Should throw an error 'No workspace found' if workspace is not found", async () => {
    try {
      const response = await request(app)
        .get(`/workspaces/9999/projects`)
        .set("authorization", "Bearer customer");
    } catch (error) {
      expect((error as OpenapiError).message).toBe("No workspace found");
    }
  });

  it("Should return a list of projects if customer is present and has some projects", async () => {
    try {
      let workspace = await getWorkspace(customer_1.id);
      expect(workspace).toHaveProperty("id");
      expect(workspace).toHaveProperty("company");
      expect(workspace).toHaveProperty("tokens");

      const response = await request(app)
        .get(`/workspaces/${customer_1.id}/projects`)
        .set("authorization", "Bearer customer");
      expect(response.status).toBe(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      response.body.forEach((project: Object) => {
        expect(project).toHaveProperty("id");
        expect(project).toHaveProperty("name");
        expect(project).toHaveProperty("campaigns_count");
      });
    } catch (error) {
      console.log(error);
      expect((error as OpenapiError).message).toBe("No workspace found");
    }
  });

  it("Should return an empty list if customer is present but has no projects", async () => {
    try {
      let workspace = await getWorkspace(customer_2.id);
      expect(workspace).toHaveProperty("id");
      expect(workspace).toHaveProperty("company");
      expect(workspace).toHaveProperty("tokens");

      const response = await request(app)
        .get(`/workspaces/${customer_2.id}/projects`)
        .set("authorization", "Bearer customer");
      expect(response.status).toBe(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    } catch (error) {
      console.log(error);
      expect((error as OpenapiError).message).toBe("No workspace found");
    }
  });
});
