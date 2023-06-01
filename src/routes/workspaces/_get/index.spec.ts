import app from "@src/app";
import request from "supertest";
import {
  fallBackCsmProfile,
  LIMIT_QUERY_PARAM_DEFAULT,
} from "@src/utils/constants";
import useCustomersData from "./useCustomersData";

describe("GET /workspaces", () => {
  useCustomersData();

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
    expect(response.body.start).toBe(0);
    expect(response.body.limit).toBe(LIMIT_QUERY_PARAM_DEFAULT);
    expect(response.body.size).toBe(2);
    expect(response.body.total).toBe(2);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          company: "Company",
          logo: "logo.png",
          tokens: 100,
          csm: fallBackCsmProfile,
        }),
        expect.objectContaining({
          id: 2,
          company: "Different Company",
          logo: "logo.png",
          tokens: 100,
          csm: fallBackCsmProfile,
        }),
      ])
    );
  });

  it("Should answer with a paginated items of workspaces", async () => {
    const response = await request(app)
      .get("/workspaces?limit=1&start=0")
      .set("authorization", "Bearer user");
    expect(response.body.start).toBe(0);
    expect(response.body.limit).toBe(1);
    expect(response.body.size).toBe(1);
    expect(response.body.total).toBe(2);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
          company: "Company",
          logo: "logo.png",
          tokens: 100,
          csm: fallBackCsmProfile,
        }),
      ])
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

  it("Should answer with an array of workspaces ordered by name DESC", async () => {
    const response = await request(app)
      .get("/workspaces?orderBy=company&order=desc")
      .set("authorization", "Bearer user");
    expect(response.body.start).toBe(0);
    expect(response.body.limit).toBe(LIMIT_QUERY_PARAM_DEFAULT);
    expect(response.body.size).toBe(2);
    expect(response.body.total).toBe(2);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 2,
          company: "Different Company",
          logo: "logo.png",
          tokens: 100,
          csm: fallBackCsmProfile,
        }),
        expect.objectContaining({
          id: 1,
          company: "Company",
          logo: "logo.png",
          tokens: 100,
          csm: fallBackCsmProfile,
        }),
      ])
    );
  });
});
