import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { ERROR_MESSAGE, LIMIT_QUERY_PARAM_DEFAULT } from "@src/utils/constants";

const customer_1 = {
  id: 1,
  company: "Company",
  company_logo: "logo.png",
  tokens: 100,
};

const customer_2 = {
  id: 2,
  company: "Company",
  company_logo: "logo.png",
  tokens: 100,
};

const profile_1 = {
  id: 1,
  wp_user_id: 1,
  name: "Customer 1",
  surname: "Customer 1",
  email: "customer1@unguess.io",
};

const profile_2 = {
  id: 33,
  wp_user_id: 13,
  name: "Customer 2",
  surname: "Customer 2",
  email: "customer2@unguess.io",
};

const profile_3 = {
  id: 34,
  wp_user_id: 14,
  name: "Customer 3",
  surname: "Customer 3",
  email: "customer3@unguess.io",
};

const user_to_customer_1 = {
  wp_user_id: profile_1.wp_user_id,
  customer_id: 1,
};
const user_to_customer_2 = {
  wp_user_id: profile_2.wp_user_id,
  customer_id: 1,
};

const user_to_customer_3 = {
  wp_user_id: profile_3.wp_user_id,
  customer_id: 1,
};

describe("GET /workspaces/{wid}/users", () => {
  beforeAll(async () => {
    return new Promise(async (res, rej) => {
      try {
        await dbAdapter.add({
          profiles: [profile_1, profile_2, profile_3],
          companies: [customer_1, customer_2],
          userToCustomers: [
            user_to_customer_1,
            user_to_customer_2,
            user_to_customer_3,
          ],
        });
      } catch (e) {
        console.error(e);
        rej(e);
      }
      res(true);
    });
  });

  it("Should return 403 status if user is not logged in", async () => {
    const response = await request(app).get("/workspaces/1/users");
    expect(response.status).toBe(403);
  });

  it("Should return 200 status if user is logged in", async () => {
    const response = await request(app)
      .get("/workspaces/1/users")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should return 400 if the request parameter has a bad format", async () => {
    const response = await request(app)
      .get("/workspaces/banana/users")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should return 403 if the customer is not found", async () => {
    const response = await request(app)
      .get("/workspaces/999898978/users")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  it("Should return 403 if the customer is not allowed to view workspace users", async () => {
    const response = await request(app)
      .get("/workspaces/2/users")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  it("Should return an array of 1 elements because of limit = 1", async () => {
    const response = await request(app)
      .get("/workspaces/1/users?limit=1")
      .set("authorization", "Bearer user");
    expect(response.body.items).toHaveLength(1);
  });

  it("Should return a paginated response with an array of users", async () => {
    const response = await request(app)
      .get("/workspaces/1/users")
      .set("authorization", "Bearer user");

    expect(response.body.size).toBe(3);

    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: profile_1.wp_user_id,
          profile_id: profile_1.id,
          name: profile_1.name + " " + profile_1.surname,
          email: profile_1.email,
        }),
        expect.objectContaining({
          id: profile_2.wp_user_id,
          profile_id: profile_2.id,
          name: profile_2.name + " " + profile_2.surname,
          email: profile_2.email,
        }),
        expect.objectContaining({
          id: profile_3.wp_user_id,
          profile_id: profile_3.id,
          name: profile_3.name + " " + profile_3.surname,
          email: profile_3.email,
        }),
      ])
    );
  });

  it("Should return an empty array items if the customer doesn't have users", async () => {
    const response = await request(app)
      .get("/workspaces/2/users")
      .set("authorization", "Bearer admin");

    expect(response.body.items).toEqual([]);
  });

  // end of describe
});
