import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";

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

const project_request_1 = {
  name: "Project 1",
  customer_id: 1,
};

const project_1 = {
  id: 1,
  name: "Project 1",
  campaigns_count: 0,
};

describe("POST /projects", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.create();

        await dbAdapter.add({
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
    const response = await request(app)
      .post("/projects")
      .send(project_request_1);
    expect(response.status).toBe(403);
  });

  it("Should answer 400 if the request body doesn't have project request schema required fields", async () => {
    const response = await request(app)
      .post("/projects")
      .set("Authorization", "Bearer customer")
      .send({
        name: "Project 1",
      });
    expect(response.status).toBe(400);
  });

  it("Should answer 403 if the user is not related to the requested workspace", async () => {
    const response = await request(app)
      .post("/projects")
      .set("Authorization", "Bearer customer")
      .send({
        ...project_request_1,
        customer_id: 2,
      });
    expect(response.status).toBe(403);
  });

  it("Should answer 403 if the workspace doesn't exist", async () => {
    const response = await request(app)
      .post("/projects")
      .set("Authorization", "Bearer customer")
      .send({
        ...project_request_1,
        customer_id: 999999,
      });
    expect(response.status).toBe(403);
  });

  it("Should answer 200 with a project object", async () => {
    const response = await request(app)
      .post("/projects")
      .set("Authorization", "Bearer customer")
      .send({
        ...project_request_1,
      });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      ...project_1,
    });
  });
});
