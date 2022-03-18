import app from "@src/app";
import request from "supertest";
import db from "@src/features/sqlite";

jest.mock("@src/features/db");
jest.mock("@appquality/wp-auth");

const unguessDb = db("unguess");
const tryberDb = db("tryber");

describe("GET /workspaces", () => {
  beforeAll(async () => {
    return new Promise(async (resolve) => {
      try {
      } catch (error) {
        console.log(error);
      }

      resolve(true);
    });
  });

  afterAll(async () => {
    return new Promise(async (resolve) => {
      try {
      } catch (error) {
        console.log(error);
      }

      resolve(true);
    });
  });

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).get("/workspaces");
    expect(response.status).toBe(403);
  });
});
