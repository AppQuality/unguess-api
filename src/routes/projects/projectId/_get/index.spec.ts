import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { ERROR_MESSAGE } from "@src/utils/constants";

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

const project_3 = {
  id: 12,
  display_name: "Projettino tre",
};

const user_to_project_1 = {
  wp_user_id: 1,
  project_id: 1,
};

const user_to_project_2 = {
  wp_user_id: 123,
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

describe("GET /projects/{pid}", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.add({
          projects: [project_1, project_2, project_3],
          userToProjects: [user_to_project_1, user_to_project_2],
          campaigns: [campaign_1],
          companies: [customer_1],
          userToCustomers: [user_to_customer_1],
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).get(`/projects/${project_1.id}`);
    expect(response.status).toBe(403);
  });

  it("Should answer 200 if logged in", async () => {
    const response = await request(app)
      .get(`/projects/${project_1.id}`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should answer 403 if project is not found", async () => {
    const response = await request(app)
      .get(`/projects/999999`)
      .set("authorization", "Bearer user");
    expect(response.body.code).toBe(403);
    expect(response.body.message).toBe(ERROR_MESSAGE);
  });

  it("Should answer 400 of the requested parameter is wrong", async () => {
    const response = await request(app)
      .get(`/projects/a`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should answer with a project object", async () => {
    const response = await request(app)
      .get(`/projects/${project_1.id}`)
      .set("authorization", "Bearer user");

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 1,
      name: "Projettino unoh",
      campaigns_count: 1,
      workspaceId: 1,
    });
  });

  it("Should answer with a project object if not associated with any customer but is an admin", async () => {
    const response = await request(app)
      .get(`/projects/${project_3.id}`)
      .set("authorization", "Bearer admin");

    expect(response.body).toMatchObject({
      id: project_3.id,
      name: "Projettino tre",
      campaigns_count: 0,
      workspaceId: -1,
    });
  });

  it("Should answer with an error if not associated with any customer and is NOT an admin", async () => {
    const response = await request(app)
      .get(`/projects/${project_3.id}`)
      .set("authorization", "Bearer user");

    expect(response.status).toBe(403);
  });

  //Should answer with an error if the project is limited to a customer
  it("Should answer with an error if the project exist but is limited to other users of the same company", async () => {
    const response = await request(app)
      .get(`/projects/${project_2.id}`)
      .set("authorization", "Bearer user");
    expect(response.body.code).toBe(403);
    expect(response.body.message).toBe(ERROR_MESSAGE);
  });
});
