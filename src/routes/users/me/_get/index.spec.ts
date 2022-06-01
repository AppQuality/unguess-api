import app from "@src/app";
import request from "supertest";

import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import companyBasic from "@src/__mocks__/database/companyBasic";

describe("GET /users/me", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.create();

        //Company without projects
        await dbAdapter.add(companyBasic);
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
    const response = await request(app).get("/users/me");
    expect(response.status).toBe(403);
  });

  it("Should answer 200 if logged in", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
  });

  it("Should return a profile_id if customer", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer customer");
    expect(response.body.role).toBe("customer");
    expect(response.body).toHaveProperty("profile_id");
    expect(response.body.profile_id).toBe(1);
  });

  it("Should return a profile_id and tryber_wp_user_id = 0 if administrator", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer administrator");
    expect(response.body.role).toBe("administrator");
    expect(response.body.profile_id).toBe(0);
    expect(response.body.tryber_wp_user_id).toBe(0);
  });

  it("Should return a customer name if customer", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer customer");
    expect(response.body.role).toBe("customer");
    expect(response.body).toHaveProperty("name");
    expect(response.body.name).not.toBe("Name Surname");
  });

  it("Should return the user workspaces", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer customer");
    expect(response.body.role).toBe("customer");
    expect(response.body).toHaveProperty("workspaces");
  });
});
