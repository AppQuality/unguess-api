import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { fallBackCsmProfile } from "@src/routes/shared";

jest.mock("@src/features/db");
jest.mock("@appquality/wp-auth");

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

describe("GET /workspaces", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.create();

        await dbAdapter.add({
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
        console.log(error);
        reject(error);
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
      .get("/workspaces")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
  });

  it("Should answer with an array of workspaces", async () => {
    const response = await request(app)
      .get("/workspaces")
      .set("authorization", "Bearer customer");
    expect(JSON.stringify(response.body)).toStrictEqual(
      JSON.stringify({
        items: [
          {
            id: customer_1.id,
            company: customer_1.company,
            logo: customer_1.company_logo,
            tokens: customer_1.tokens,
            csm: fallBackCsmProfile,
          },
        ],
        start: 0,
        limit: 10,
        size: 1,
        total: 1,
      })
    );
  });

  it("Should answer with a paginated items of workspaces", async () => {
    const response = await request(app)
      .get("/workspaces?limit=1&start=0")
      .set("authorization", "Bearer customer");
    expect(JSON.stringify(response.body)).toStrictEqual(
      JSON.stringify({
        items: [
          {
            id: customer_1.id,
            company: customer_1.company,
            logo: customer_1.company_logo,
            tokens: customer_1.tokens,
            csm: fallBackCsmProfile,
          },
        ],
        start: 0,
        limit: 1,
        size: 1,
        total: 1,
      })
    );
  });

  // Should return an error if the limit is not a number
  it("Should answer with an error if the limit is not a number", async () => {
    const response = await request(app)
      .get("/workspaces?limit=banana&start=0")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(400);
    expect(response.body.err[0].message).toBe("should be number");
  });
});
