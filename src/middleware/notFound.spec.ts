import app from "@src/app";
import request from "supertest";

describe("Check NotFound middleware", () => {
  it("should return 404 and a not found err", async () => {
    const response = await request(app).get("/fakes/route-that-doesnt-exist");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      err: "not found",
    });
  });
});
