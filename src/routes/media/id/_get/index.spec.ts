import app from "@src/app";
import { tryber } from "@src/features/database";
import request from "supertest";
import { getPresignedUrl } from "@src/features/s3/getPresignedUrl";

jest.mock("@src/features/s3/getPresignedUrl", () => {
  return {
    getPresignedUrl: jest.fn(() => {
      return "https://example.com/PRE_SIGNED_URL";
    }),
  };
});

describe("GET /media/:id", () => {
  beforeAll(async () => {
    await tryber.tables.WpAppqEvdBugMedia.do().insert({
      id: 1,
      bug_id: 1,
      location: "https://s3.eu-west-1.amazonaws.com/bucket/key.jpg",
    });
  });
  afterAll(async () => {
    await tryber.tables.WpAppqEvdBugMedia.do().delete();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("Should redirect to login page if logged out", async () => {
    const response = await request(app).get(
      "/media/aHR0cHM6Ly9zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9idWNrZXQva2V5LmpwZw=="
    );
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("https://app.unguess.io/login");
  });
  it("Should respond 403 if there is no media that when base64 encoded matches id", async () => {
    const response = await request(app)
      .get("/media/bm9uZXNpc3Rl")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  it("Should respond 302 if media that when base64 encoded matches id exists", async () => {
    const response = await request(app)
      .get(
        "/media/aHR0cHM6Ly9zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9idWNrZXQva2V5LmpwZw=="
      )
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(302);
  });

  it("Should respond 302 and redirect to presigned url", async () => {
    const response = await request(app)
      .get(
        "/media/aHR0cHM6Ly9zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9idWNrZXQva2V5LmpwZw=="
      )
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(302);
    expect(getPresignedUrl).toBeCalledTimes(1);
    expect(response.headers.location).toBe(
      "https://example.com/PRE_SIGNED_URL"
    );
  });
});
