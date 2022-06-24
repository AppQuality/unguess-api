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

const customer_3 = {
  id: 43,
  company: "Company",
  company_logo: "logo.png",
  tokens: 100,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 1,
};

const user_to_customer_2 = {
  wp_user_id: 1,
  customer_id: 2,
};

const customer_profile_1 = {
  id: 1,
  wp_user_id: 1,
  name: "Customer",
  surname: "Customer",
  email: "customer@unguess.io",
};

const coins_1 = {
  id: 1,
  customer_id: 1,
  amount: 100,
  price: 0,
  created_on: "2022-06-24 12:47:30",
  updated_on: "2022-06-24 12:51:23",
};

const coins_2 = {
  ...coins_1,
  id: 2,
  amount: 50,
};

const coins_3 = {
  ...coins_1,
  id: 3,
  customer_id: 2,
};

describe("GET /workspaces/{wid}/coins", () => {
  beforeAll(async () => {
    return new Promise(async (res, rej) => {
      try {
        await dbAdapter.create();

        await dbAdapter.add({
          profiles: [customer_profile_1],
          companies: [customer_1, customer_2, customer_3],
          userToCustomers: [user_to_customer_1, user_to_customer_2],
          coins: [coins_1, coins_2, coins_3],
        });
      } catch (e) {
        console.error(e);
        rej(e);
      }
      res(true);
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

  it("Should return 403 status if user is not logged in", async () => {
    const response = await request(app).get("/workspaces/1/coins");
    expect(response.status).toBe(403);
  });

  it("Should return 200 status if user is logged in", async () => {
    const response = await request(app)
      .get("/workspaces/1/coins")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
  });

  it("Should return 400 if the request parameter has a bad format", async () => {
    const response = await request(app)
      .get("/workspaces/banana/coins")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(400);
  });

  it("Should return 403 if the customer is not found", async () => {
    const response = await request(app)
      .get("/workspaces/999898978/coins")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(403);
    expect(response.body.message).toBe(ERROR_MESSAGE);
  });

  it("Should return an array of 1 elements because of limit = 1", async () => {
    const response = await request(app)
      .get("/workspaces/2/coins?limit=1")
      .set("authorization", "Bearer customer");
    expect(response.body.items.length).toBe(1);
  });

  it("Should return an array of 1 element because start is set to 1", async () => {
    const response = await request(app)
      .get("/workspaces/2/coins?limit=1")
      .set("authorization", "Bearer customer");
    expect(response.body.items.length).toBe(1);
  });

  it("Should return an error 400 if the limit is not a number", async () => {
    const response = await request(app)
      .get("/workspaces/2/coins?limit=asd&start=1")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(400);
    expect(response.body.err[0].message).toBe("should be number");
  });

  it("Should return a paginated response with an array of coins", async () => {
    const response = await request(app)
      .get("/workspaces/1/coins")
      .set("authorization", "Bearer customer");

    expect(response.body.size).toBe(2);

    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining(coins_1),
        expect.objectContaining(coins_2),
      ])
    );
  });

  it("Should return a paginated response with an array of coins respecting the limit and the default order", async () => {
    const response = await request(app)
      .get("/workspaces/1/coins?limit=1")
      .set("authorization", "Bearer customer");

    expect(response.body.size).toBe(1);

    expect(response.body.items).toEqual(
      expect.arrayContaining([expect.objectContaining(coins_2)])
    );
  });

  it("Should return a paginated response with an array of coins respecting the limit and the order", async () => {
    const response = await request(app)
      .get("/workspaces/1/coins?limit=1&orderBy=id&order=asc")
      .set("authorization", "Bearer customer");

    expect(response.body.size).toBe(1);

    expect(response.body.items).toEqual(
      expect.arrayContaining([expect.objectContaining(coins_1)])
    );
  });

  it("Should return 200 because the orderBy is invalid so will be ignored", async () => {
    const response = await request(app)
      .get("/workspaces/1/coins?orderBy=banana")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining(coins_1),
        expect.objectContaining(coins_2),
      ])
    );
  });
});
