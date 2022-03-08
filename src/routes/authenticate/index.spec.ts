import app from "@src/app"
import sqlite3 from "@src/features/sqlite"
import request from "supertest"
jest.mock("@src/features/db")
jest.mock("@appquality/wp-auth")

describe("Route POST authenticate", () => {
  it("Should answer 200 if logged in", async () => {
    const response = await request(app).post("/authenticate")
    console.log(response.body)
    expect(response.status).toBe(200)
  });
});