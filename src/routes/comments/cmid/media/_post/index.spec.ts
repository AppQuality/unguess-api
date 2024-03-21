import app from "@src/app";
import { tryber } from "@src/features/database";
import upload from "@src/features/s3/upload";
import request from "supertest";

jest.mock("@src/features/s3/upload");

describe("Route POST /comments/{cmid}/media", () => {
  beforeAll(async () => {
    (upload as jest.Mock).mockImplementation(
      ({ key, bucket }: { bucket: string; key: string }) => {
        return `https://s3.amazonaws.com/${bucket}/${key}`;
      }
    );
    await tryber.tables.WpAppqEvdProfile.do().insert({
      id: 1,
      wp_user_id: 1,
      email: "john@example.com",
      education_id: 1,
      employment_id: 1,
    });
    await tryber.tables.WpUsers.do().insert({
      ID: 1,
    });
  });
  afterAll(async () => {
    await tryber.tables.WpAppqEvdProfile.do().delete();
    await tryber.tables.WpUsers.do().delete();
  });
  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).post("/comments/1/media");
    expect(response.status).toBe(403);
  });
  it("Should answer 200 and mark as failed if try to send file as .bat, .sh and .exe", async () => {
    const mockFileBuffer = Buffer.from("some data");

    const response = await request(app)
      .post("/comments/1/media")
      .attach("media", mockFileBuffer, "void.bat")
      .attach("media", mockFileBuffer, "image.png")
      .attach("media", mockFileBuffer, "void.sh")
      .attach("media", mockFileBuffer, "void.exe")
      .set("authorization", "Bearer user");
    console.log(response.body);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("failed", [
      { errorCode: "INVALID_FILE_EXTENSION", name: "void.bat" },
      { errorCode: "INVALID_FILE_EXTENSION", name: "void.sh" },
      { errorCode: "INVALID_FILE_EXTENSION", name: "void.exe" },
    ]);
  });
  it("Should answer 200 and mark as failed if try to send an oversized file", async () => {
    process.env.MAX_FILE_SIZE = "100";
    // a buffer with size of 101 bytes
    const mockFileBuffer = Buffer.alloc(101);

    const response = await request(app)
      .post("/comments/1/media")
      .attach("media", mockFileBuffer, "oversized.png")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty("failed", [
      { errorCode: "FILE_TOO_BIG", name: "oversized.png" },
    ]);
  });
});
