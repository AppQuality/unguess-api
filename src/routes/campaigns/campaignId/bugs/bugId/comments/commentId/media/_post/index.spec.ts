import app from "@src/app";
import { tryber, unguess } from "@src/features/database";
import upload from "@src/features/s3/upload";
import request from "supertest";

jest.mock("@src/features/s3/upload");

describe("Route POST /campaigns/1/bugs/1/comments/{cmid}/media", () => {
  beforeAll(async () => {
    (upload as jest.Mock).mockImplementation(
      ({ key, bucket }: { bucket: string; key: string }) => {
        return `https://s3.amazonaws.com/${bucket}/item.png`;
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
    await unguess.tables.UgBugsComments.do().insert([
      {
        id: 1,
        text: "comment 1",
        bug_id: 1,
        profile_id: 1,
        creation_date_utc: "2021-10-19 12:57:57.0",
        is_deleted: 0,
      },
    ]);

    await tryber.tables.WpAppqEvdCampaign.do().insert({
      id: 1,
      title: "campaign 1",
      page_manual_id: 1,
      page_preview_id: 1,
      platform_id: 1,
      start_date: "2021-10-19 12:57:57.0",
      end_date: "2021-10-19 12:57:57.0",
      close_date: "2021-10-19 12:57:57.0",
      customer_id: 1,
      pm_id: 1,
      project_id: 1,
      customer_title: "title",
    });

    await tryber.tables.WpAppqUserToCampaign.do().insert({
      wp_user_id: 1,
      campaign_id: 1,
    });
    await tryber.tables.WpAppqProject.do().insert({
      id: 1,
      display_name: "project 1",
      customer_id: 1,
      edited_by: 1,
    });

    await tryber.tables.WpAppqCustomer.do().insert({
      id: 1,
      company: "company 1",
      pm_id: 1,
    });

    await tryber.tables.WpAppqEvdBug.do().insert({
      id: 1,
      wp_user_id: 1,
      reviewer: 1,
      last_editor_id: 1,
      campaign_id: 1,
    });
  });
  afterAll(async () => {
    await tryber.tables.WpAppqEvdProfile.do().delete();
    await tryber.tables.WpUsers.do().delete();
    await tryber.tables.WpAppqEvdCampaign.do().delete();
    await tryber.tables.WpAppqUserToCampaign.do().delete();
    await tryber.tables.WpAppqProject.do().delete();
    await tryber.tables.WpAppqCustomer.do().delete();
  });

  afterEach(async () => {
    await unguess.tables.UgBugsCommentsMedia.do().delete();
  });

  it("Should answer 400 if the comment does not exist", async () => {
    const mockFileBuffer = Buffer.from("some data");

    const response = await request(app)
      .post("/campaigns/1/bugs/1/comments/99/media")
      .attach("media", mockFileBuffer, "image.png")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });
  it("Should answer 200 and mark as failed if try to send file as .bat, .sh and .exe", async () => {
    const mockFileBuffer = Buffer.from("some data");

    const response = await request(app)
      .post("/campaigns/1/bugs/1/comments/1/media")
      .attach("media", mockFileBuffer, "void.bat")
      .attach("media", mockFileBuffer, "image.png")
      .attach("media", mockFileBuffer, "void.sh")
      .attach("media", mockFileBuffer, "void.exe")
      .set("authorization", "Bearer user");
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
      .post("/campaigns/1/bugs/1/comments/1/media")
      .attach("media", mockFileBuffer, "oversized.png")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty("failed", [
      { errorCode: "FILE_TOO_BIG", name: "oversized.png" },
    ]);
  });

  it("Should insert the media in database", async () => {
    const mockFileBuffer = Buffer.from("some data");

    const response = await request(app)
      .post("/campaigns/1/bugs/1/comments/1/media")
      .attach("media", mockFileBuffer, "image.png")
      .attach("media", mockFileBuffer, "image2.png")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);

    const media = await unguess.tables.UgBugsCommentsMedia.do().select();
    expect(media).toHaveLength(2);
    expect(media[0]).toMatchObject({
      comment_id: 1,
      url: "https://s3.amazonaws.com/unguess-comments-media/item.png",
    });
    expect(media[1]).toMatchObject({
      comment_id: 1,
      url: "https://s3.amazonaws.com/unguess-comments-media/item.png",
    });
  });
});
