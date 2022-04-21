import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { ERROR_MESSAGE } from "@src/routes/shared";

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
  display_name: "Project 1",
  customer_id: 1,
};

const user_to_project_1 = {
  wp_user_id: 1,
  project_id: 1,
};

const campaign_request_1 = {
  description: "Campaign 1 description",
  start_date: "2020-01-01",
  end_date: "2020-01-01",
  close_date: "2020-01-01",
  title: "Campaign 1 title",
  customer_title: "Campaign 1 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: 1,
  test_type_id: 1,
  project_id: 1,
};

describe("POST /campaigns", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.create();

        await dbAdapter.add({
          customers: [customer_1],
          userToCustomers: [user_to_customer_1],
          projects: [project_1],
          userToProjects: [user_to_project_1],
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
      .post("/campaigns")
      .send(campaign_request_1);
    expect(response.status).toBe(403);
  });

  it("Should answer 400 if the request body is not like a campaign request schema", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer customer")
      .send({
        description: "Campaign 1 description",
        start_date: "2020-01-01",
        end_date: "2020-01-01",
        close_date: "2020-01-01",
        title: "Campaign 1 title",
        customer_title: "Campaign 1 customer title",
      });
    expect(response.status).toBe(400);
  });

  it("Should answer 200 with a campaign object if logged in", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer customer")
      .send(campaign_request_1);
    expect(response.status).toBe(200);
    expect(response.body).toBe(JSON.stringify(campaign_request_1));
  });

  // test type id

  // the user cant create a campaign of a project he is not part of

  // the user cant create a campaign with a project that doesn't exist
});
