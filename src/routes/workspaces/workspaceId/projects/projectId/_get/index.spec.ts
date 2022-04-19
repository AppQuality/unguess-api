import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";

jest.mock("@src/features/db");
jest.mock("@appquality/wp-auth");

const customer_user_1 = {
  ID: 1,
  user_login: "customer@unguess.io",
  user_pass: "password",
  user_email: "customer@unguess.io",
};

const customer_1 = {
  id: 1,
  company: "Company 1",
  company_logo: "logo1.png",
  tokens: 100,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 1,
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

describe("GET /workspaces/{wid}/projects/{pid}", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.create();

        await dbAdapter.add({
          projects: [project_1, project_2],
          userToProjects: [user_to_project_1, user_to_project_2],
          campaigns: [campaign_1],
          companies: [customer_1],
          userToCustomers: [user_to_customer_1],
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

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).get(
      `/workspaces/${customer_1.id}/projects/${project_1.id}`
    );
    expect(response.status).toBe(403);
  });

  it("Should answer 200 if logged in", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}/projects/${project_1.id}`)
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
  });

  it("Should answer 404 if no workspaces are found", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}/projects/999999`)
      .set("authorization", "Bearer customer");
    expect(response.body.code).toBe(404);
    expect(response.body.message).toBe("Something went wrong");
  });

  it("Should answer 400 of the requested parameter is wrong", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}/projects/a`)
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(400);
  });

  it("Should answer with a project object", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}/projects/${project_1.id}`)
      .set("authorization", "Bearer customer");
    expect(response.body).toMatchObject({
      id: 1,
      name: "Projettino unoh",
      campaigns_count: 1,
    });
  });
});
