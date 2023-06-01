import app from "@src/app";
import request from "supertest";
import { ERROR_MESSAGE } from "@src/utils/constants";
import useCustomersData from "./useCustomersData";

describe("GET /workspaces/{wid}/coins", () => {
  useCustomersData();

  it("Should return 403 status if user is not logged in", async () => {
    const response = await request(app).get("/workspaces/1/coins");
    expect(response.status).toBe(403);
  });

  it("Should return 200 status if user is logged in", async () => {
    const response = await request(app)
      .get("/workspaces/1/coins")
      .set("authorization", "Bearer user");
    console.log(response.body);
    expect(response.status).toBe(200);
  });

  it("Should return 400 if the request parameter has a bad format", async () => {
    const response = await request(app)
      .get("/workspaces/banana/coins")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should return 403 if the customer is not found", async () => {
    const response = await request(app)
      .get("/workspaces/999898978/coins")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(403);
    expect(response.body.message).toBe(ERROR_MESSAGE);
  });

  it("Should return an array of 1 elements because of limit = 1", async () => {
    const response = await request(app)
      .get("/workspaces/2/coins?limit=1")
      .set("authorization", "Bearer user");
    expect(response.body.items).toHaveLength(1);
  });

  it("Should return an array of 1 element because start is set to 1", async () => {
    const response = await request(app)
      .get("/workspaces/2/coins?limit=1")
      .set("authorization", "Bearer user");
    expect(response.body.items).toHaveLength(1);
  });

  it("Should return an error 400 if the limit is not a number", async () => {
    const response = await request(app)
      .get("/workspaces/2/coins?limit=asd&start=1")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(400);
    expect(response.body.err[0].message).toBe("should be number");
  });

  it("Should return a paginated response with an array of coins", async () => {
    const response = await request(app)
      .get("/workspaces/1/coins")
      .set("authorization", "Bearer user");

    expect(response.body.size).toBe(2);

    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          customer_id: 1,
          amount: 100,
          price: 0,
          created_on: "2022-06-24 12:47:30",
          updated_on: "2022-06-24 12:51:23",
        }),
        expect.objectContaining({
          id: 2,
          customer_id: 1,
          amount: 50,
          price: 0,
          created_on: "2022-06-24 12:47:30",
          updated_on: "2022-06-24 12:51:23",
        }),
      ])
    );
  });

  it("Should return a paginated response with an array of coins respecting the limit and the default order", async () => {
    const response = await request(app)
      .get("/workspaces/1/coins?limit=1")
      .set("authorization", "Bearer user");

    expect(response.body.size).toBe(1);

    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 2,
          customer_id: 1,
          amount: 50,
          price: 0,
          created_on: "2022-06-24 12:47:30",
          updated_on: "2022-06-24 12:51:23",
        }),
      ])
    );
  });

  it("Should return a paginated response with an array of coins respecting the limit and the order", async () => {
    const response = await request(app)
      .get("/workspaces/1/coins?limit=1&orderBy=id&order=asc")
      .set("authorization", "Bearer user");

    expect(response.body.size).toBe(1);

    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          customer_id: 1,
          amount: 100,
          price: 0,
          created_on: "2022-06-24 12:47:30",
          updated_on: "2022-06-24 12:51:23",
        }),
      ])
    );
  });

  it("Should return 200 because the orderBy is invalid so will be ignored", async () => {
    const response = await request(app)
      .get("/workspaces/1/coins?orderBy=banana")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          customer_id: 1,
          amount: 100,
          price: 0,
          created_on: "2022-06-24 12:47:30",
          updated_on: "2022-06-24 12:51:23",
        }),
        expect.objectContaining({
          id: 2,
          customer_id: 1,
          amount: 50,
          price: 0,
          created_on: "2022-06-24 12:47:30",
          updated_on: "2022-06-24 12:51:23",
        }),
      ])
    );
  });
});
