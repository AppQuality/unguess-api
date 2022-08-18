import app from "@src/app";
import request from "supertest";
import fs from "fs";
import getExample from "@src/middleware/getExample";
jest.mock("@src/middleware/getExample");

describe("App", () => {
  it("should return a valid app", () => {
    expect(app).toBeInstanceOf(Function);
  });
  it("should return the reference", async () => {
    const response = await request(app).get("/reference");
    expect(response.status).toBe(200);
    const referenceFile = fs.readFileSync(
      "./src/reference/openapi.yml",
      "utf8"
    );
    expect(response.text).toEqual(referenceFile);
  });
  it("should return a specific example if requested", async () => {
    const response = await request(app)
      .get("/")
      .set("x-mock-example", "200:test");
    expect(getExample).toBeCalledTimes(1);
    expect(getExample).toBeCalledWith(
      expect.anything(),
      "/",
      "GET",
      "200",
      "test"
    );
  });
});
