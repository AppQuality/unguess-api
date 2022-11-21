import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import {
  fallBackCsmProfile,
  LIMIT_QUERY_PARAM_DEFAULT,
} from "@src/utils/constants";

const customer_1 = {
  id: 1,
  company: "Company",
  company_logo: "logo.png",
  tokens: 100,
};

const customer_2 = {
  ...customer_1,
  id: 2,
  company: "Different Company",
};

const customer_3 = {
  ...customer_1,
  id: 3,
  company: "Zoom",
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 1,
};

const user_to_customer_2 = {
  wp_user_id: 1,
  customer_id: 2,
};

describe("GET /workspaces", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.add({
          companies: [customer_1, customer_2, customer_3],
          userToCustomers: [user_to_customer_1, user_to_customer_2],
        });
      } catch (error) {
        console.error(error);
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
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should answer with an array of workspaces", async () => {
    const response = await request(app)
      .get("/workspaces")
      .set("authorization", "Bearer user");
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
          {
            id: customer_2.id,
            company: customer_2.company,
            logo: customer_2.company_logo,
            tokens: customer_2.tokens,
            csm: fallBackCsmProfile,
          },
        ],
        start: 0,
        limit: LIMIT_QUERY_PARAM_DEFAULT,
        size: 2,
        total: 2,
      })
    );
  });

  it("Should answer with a paginated items of workspaces", async () => {
    const response = await request(app)
      .get("/workspaces?limit=1&start=0")
      .set("authorization", "Bearer user");
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
        total: 2,
      })
    );
  });

  // Should return an error if the limit is not a number
  it("Should answer with an error if the limit is not a number", async () => {
    const response = await request(app)
      .get("/workspaces?limit=banana&start=0")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(400);
    expect(response.body.err[0].message).toBe("should be number");
  });

  it("Should answer with an array of workspaces ordered by name", async () => {
    const response = await request(app)
      .get("/workspaces?orderBy=company&order=desc")
      .set("authorization", "Bearer user");
    expect(JSON.stringify(response.body)).toStrictEqual(
      JSON.stringify({
        items: [
          {
            id: customer_2.id,
            company: customer_2.company,
            logo: customer_2.company_logo,
            tokens: customer_2.tokens,
            csm: fallBackCsmProfile,
          },
          {
            id: customer_1.id,
            company: customer_1.company,
            logo: customer_1.company_logo,
            tokens: customer_1.tokens,
            csm: fallBackCsmProfile,
          },
        ],
        start: 0,
        limit: LIMIT_QUERY_PARAM_DEFAULT,
        size: 2,
        total: 2,
      })
    );
  });
});
