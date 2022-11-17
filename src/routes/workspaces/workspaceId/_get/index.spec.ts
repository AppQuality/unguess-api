import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { fallBackCsmProfile } from "@src/utils/constants";

const customer_profile_1 = {
  id: 1,
  wp_user_id: 1,
  name: "Customer",
  surname: "Customer",
  email: "customer@unguess.io",
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

describe("GET /workspaces/{wid}", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.add({
          profiles: [customer_profile_1],
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
    const response = await request(app).get(`/workspaces/${customer_1.id}`);
    expect(response.status).toBe(403);
  });

  it("Should answer 200 if logged in", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should answer 403 if no workspaces are found", async () => {
    const response = await request(app)
      .get("/workspaces/99999")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  it("Should answer 400 of the requested parameter is wrong", async () => {
    const response = await request(app)
      .get("/workspaces/banana")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should answer with a workspace object", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(JSON.stringify(response.body)).toBe(
      JSON.stringify({
        id: customer_1.id,
        company: customer_1.company,
        tokens: customer_1.tokens,
        logo: customer_1.company_logo,
        csm: fallBackCsmProfile,
        coins: 0,
      })
    );
  });
});
