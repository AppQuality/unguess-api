import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import Projects, { data as projectData } from "@src/__mocks__/database/project";
import { ERROR_MESSAGE } from "@src/utils/constants";

const customer_1 = {
  id: 12,
  company: "Company 1",
  company_logo: "logo1.png",
  tokens: 100,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 12,
};

const project_1 = {
  id: 32,
  display_name: "An awesome project",
  customer_id: 12,
};

const project_2 = {
  id: 2,
  display_name: "A not so awesome project",
  customer_id: 12,
};

const project_3 = {
  id: 3,
  display_name: "A not so awesome project",
  customer_id: 20,
};

const user_to_project_1 = {
  wp_user_id: 1,
  project_id: 32,
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
  project_id: 32,
  customer_id: 1,
};

describe("PATCH /projects/{pid}", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.add({
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
  afterAll(async () => {
    await dbAdapter.clear();
  });

  beforeEach(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        // Restore initial data for projects
        await projectData.basicProject(project_1);
        await projectData.basicProject(project_2);
        await projectData.basicProject(project_3);

        resolve(true);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  });

  afterEach(async () => {
    await Projects.clear();
  });

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).patch(`/projects/${project_1.id}`);
    expect(response.status).toBe(403);
  });

  it("Should answer 400 if logged in but no body is provided", async () => {
    const response = await request(app)
      .patch(`/projects/${project_1.id}`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should answer 403 if project is not found", async () => {
    const response = await request(app)
      .patch(`/projects/999999`)
      .set("authorization", "Bearer user")
      .send({ display_name: "New name" });
    expect(response.status).toBe(403);
  });

  it("Should answer 403 if user is not part of the project", async () => {
    const response = await request(app)
      .patch(`/projects/${project_3.id}`)
      .set("authorization", "Bearer user")
      .send({ display_name: "New name" });
    expect(response.status).toBe(403);
  });

  it("Should answer 400 if the body object doesn't contains required fields", async () => {
    const response = await request(app)
      .patch(`/projects/${project_1.id}`)
      .set("authorization", "Bearer user")
      .send({ wrong_key: "New name" });
    expect(response.status).toBe(400);
  });

  it("Should answer 400 if the display_name has more than 64 characters", async () => {
    const response = await request(app)
      .patch(`/projects/${project_1.id}`)
      .set("authorization", "Bearer user")
      .send({ display_name: "a".repeat(65) });
    expect(response.status).toBe(400);
  });

  it("Should answer 200 if a valid body is provided", async () => {
    const response = await request(app)
      .patch(`/projects/${project_1.id}`)
      .set("authorization", "Bearer user")
      .send({ display_name: "New name" });

    expect(response.status).toBe(200);
  });

  it("Should answer 200 with a project object with the new patched value", async () => {
    const response = await request(app)
      .patch(`/projects/${project_1.id}`)
      .set("authorization", "Bearer user")
      .send({ display_name: "New name" });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: project_1.id,
      name: "New name",
      campaigns_count: 1,
    });
  });

  //Should answer 200 if the user has no permission to the project but is related to the same workspace
  it("Should answer 200 if the user has no permission to the project but is related to the same workspace", async () => {
    const response = await request(app)
      .patch(`/projects/${project_2.id}`)
      .set("authorization", "Bearer user")
      .send({ display_name: "New name" });
    expect(response.status).toBe(200);
  });
});
