import app from "@src/app";
import request from "supertest";

jest.mock("@src/features/db");
jest.mock("@appquality/wp-auth");

describe("GET /users/me", () => {
  beforeAll(async () => {
    return new Promise(async (resolve) => {
      resolve(true);
    });
  });
  afterAll(async () => {
    return new Promise(async (resolve) => {
      resolve(true);
    });
  });

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).get("/users/me");
    expect(response.status).toBe(403);
  });

  it("Should answer 200 if logged in", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
  });
});
