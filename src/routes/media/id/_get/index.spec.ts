import app from "@src/app";
import { tryber } from "@src/features/database";
import request from "supertest";
import { getPresignedUrl } from "@src/features/s3/getPresignedUrl";
import formatDate from "@src/features/formatDate";

const twoDaysAgo = new Date();
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

const campaign_1 = {
  id: 1,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 2 title",
  customer_title: "Campaign 1 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: 1,
  campaign_type: -1,
  base_bug_internal_id: "CP01",
  platform_id: 1,
  page_preview_id: 1,
  page_manual_id: 1,
  customer_id: 0,
  pm_id: 1,
};
const bug_1 = {
  id: 1,
  internal_id: "BUG011",
  message: "[CON-TEXT-bike] - Bug 1 super-message",
  description: "Bug 1 description",
  expected_result: "Bug 1 expected result",
  current_result: "Bug 1 current result",
  campaign_id: campaign_1.id,
  bug_type_id: 1,
  bug_replicability_id: 1,
  status_id: 2,
  status_reason: "Bug 1 status reason",
  application_section: "Bug 1 application section",
  note: "Bug 1 note",
  wp_user_id: 1,
  dev_id: 1,
  is_duplicated: 1,
  duplicated_of_id: 2,
  manufacturer: "Apple",
  model: "iPhone 13",
  os: "iOS",
  os_version: "iOS 16 (16)",
  severity_id: 1,
  reviewer: 1,
  last_editor_id: 1,
};

jest.mock("@src/features/s3/getPresignedUrl", () => {
  return {
    getPresignedUrl: jest.fn(() => {
      return "https://example.com/PRE_SIGNED_URL";
    }),
  };
});
describe("GET /media/:id", () => {
  beforeAll(async () => {
    await tryber.tables.WpAppqCustomer.do().insert({
      id: 999,
      company: "Company 999",
      pm_id: 1,
    });
    await tryber.tables.WpAppqEvdCampaign.do().insert([
      { ...campaign_1, id: 1, project_id: 1 },
    ]);

    await tryber.tables.WpAppqEvdBug.do().insert([
      bug_1, //normal bug - CP1
      { ...bug_1, id: 2 }, //public bug - CP1
      { ...bug_1, id: 3 }, //expired public bug - CP1
    ]);
    await tryber.tables.WpAppqEvdBugMedia.do().insert([
      {
        id: 1,
        bug_id: 1, //media of normal bug - CP1
        location:
          "https://s3.eu-west-1.amazonaws.com/bucket/media_of_normal_bug.jpg",
      },
      {
        id: 2,
        bug_id: 2, //media of public bug - CP1
        location:
          "https://s3.eu-west-1.amazonaws.com/bucket/media_of_public_bug.jpg",
      },
      {
        id: 3,
        bug_id: 3, //exipred media of public bug - CP1
        location:
          "https://s3.eu-west-1.amazonaws.com/bucket/expired_media_of_public_bug.jpg",
      },
    ]);
    await tryber.tables.WpAppqBugLink.do().insert([
      {
        id: 1,
        bug_id: 2,
        expiration: 1, //not expired
        creation_date: formatDate(new Date()),
      },
      {
        id: 2,
        bug_id: 3,
        expiration: 1, //expired
        creation_date: formatDate(twoDaysAgo),
      },
    ]);
  });
  afterAll(async () => {
    await tryber.tables.WpAppqEvdBugMedia.do().delete();
    await tryber.tables.WpAppqEvdBug.do().delete();
    await tryber.tables.WpAppqBugLink.do().delete();
    await tryber.tables.WpAppqEvdCampaign.do().delete();
    await tryber.tables.WpAppqCustomer.do().delete();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("Should redirect to login page if logged out", async () => {
    const response = await request(app).get(
      "/media/aHR0cHM6Ly9zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9idWNrZXQvbWVkaWFfb2Zfbm9ybWFsX2J1Zy5qcGc="
    );
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/login");
  });
  it("Should redirect to presigned url if logged out and bug is public", async () => {
    //media of public bug2 in cp1
    const response = await request(app).get(
      "/media/aHR0cHM6Ly9zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9idWNrZXQvbWVkaWFfb2ZfcHVibGljX2J1Zy5qcGc="
    );
    expect(response.status).toBe(302);
    expect(getPresignedUrl).toBeCalledTimes(1);
    expect(response.headers.location).toBe(
      "https://example.com/PRE_SIGNED_URL"
    );
  });
  it("Should redirect to login if bug is public but media is expired", async () => {
    //expired media of public bug2 in cp1
    const response = await request(app).get(
      "/media/aHR0cHM6Ly9zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9idWNrZXQvZXhwaXJlZF9tZWRpYV9vZl9wdWJsaWNfYnVnLmpwZw=="
    );
    expect(response.status).toBe(302);
    expect(getPresignedUrl).toBeCalledTimes(0);
    expect(response.headers.location).toBe("/login");
  });
  it("Should redirect to ErrorPage if logged in and user is unauthorized to workspace", async () => {
    const response = await request(app)
      .get(
        "/media/aHR0cHM6Ly9zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9idWNrZXQvbm9fYWNjZXNzX3RvX3dvcmtzcGFjZS5qcGc="
      )
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(302);
    expect(getPresignedUrl).toBeCalledTimes(0);
    expect(response.headers.location).toBe("/media/oops");
  });
  it("Should respond 302 and redirect to presigned url if logged in as admin", async () => {
    //media of unauthorize bug3 in cp2
    const response = await request(app)
      .get(
        "/media/aHR0cHM6Ly9zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9idWNrZXQvbWVkaWFfb2Zfbm9ybWFsX2J1Zy5qcGc="
      )
      .set("Authorization", "Bearer admin");
    expect(response.status).toBe(302);
    expect(getPresignedUrl).toBeCalledTimes(1);
    expect(response.headers.location).toBe(
      "https://example.com/PRE_SIGNED_URL"
    );
  });
  it("Should redirect to ErrorPage if logged in and decoded base64 does not exist", async () => {
    const response = await request(app)
      .get("/media/ZmFrZV9iYXNlNjQ=")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(302);
    expect(getPresignedUrl).toBeCalledTimes(0);
    expect(response.headers.location).toBe("/media/oops");
  });
  it("Should redirect to ErrorPage if logged in and base64 is not valid", async () => {
    const response = await request(app)
      .get("/media/invalid_base64=")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(302);
    expect(getPresignedUrl).toBeCalledTimes(0);
    expect(response.headers.location).toBe("/media/oops");
  });
  describe("Only workspace access", () => {
    beforeAll(async () => {
      // permission on workspaces - user_to_workspace - user to companies
      await tryber.tables.WpAppqUserToCustomer.do().insert([
        {
          wp_user_id: 1,
          customer_id: 999,
        },
      ]);
      await tryber.tables.WpAppqProject.do().insert([
        { id: 1, customer_id: 999, display_name: "Project 1", edited_by: 1 },
      ]);
    });
    afterAll(async () => {
      await tryber.tables.WpAppqUserToCustomer.do().delete();
      await tryber.tables.WpAppqProject.do().delete();
    });
    it("Should respond 302 if media that when base64 encoded matches id exists", async () => {
      //media of bug1 in cp1
      const response = await request(app)
        .get(
          "/media/aHR0cHM6Ly9zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9idWNrZXQvbWVkaWFfb2Zfbm9ybWFsX2J1Zy5qcGc="
        )
        .set("Authorization", "Bearer user");
      expect(response.status).toBe(302);
    });
    it("Should respond 302 and redirect to presigned url", async () => {
      //media of bug1 in cp1
      const response = await request(app)
        .get(
          "/media/aHR0cHM6Ly9zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9idWNrZXQvbWVkaWFfb2Zfbm9ybWFsX2J1Zy5qcGc="
        )
        .set("Authorization", "Bearer user");
      expect(response.status).toBe(302);
      expect(getPresignedUrl).toBeCalledTimes(1);
      expect(response.headers.location).toBe(
        "https://example.com/PRE_SIGNED_URL"
      );
    });
  });
  describe("GET /media/:id - only project access", () => {
    beforeAll(async () => {
      //permission on projects - user_to_project
      await tryber.tables.WpAppqUserToProject.do().insert([
        {
          wp_user_id: 1,
          project_id: 1,
        },
        { wp_user_id: 1, project_id: 2222 },
      ]);
      await tryber.tables.WpAppqProject.do().insert([
        { id: 1, customer_id: 999, display_name: "Project 1", edited_by: 1 },
      ]);
    });
    afterAll(async () => {
      await tryber.tables.WpAppqUserToProject.do().delete();
      await tryber.tables.WpAppqProject.do().delete();
    });
    it("Should respond 302 if media that when base64 encoded matches id exists", async () => {
      //media of bug1 in cp1
      const response = await request(app)
        .get(
          "/media/aHR0cHM6Ly9zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9idWNrZXQvbWVkaWFfb2Zfbm9ybWFsX2J1Zy5qcGc="
        )
        .set("Authorization", "Bearer user");
      expect(response.status).toBe(302);
    });

    it("Should respond 302 and redirect to presigned url", async () => {
      //media of bug1 in cp1
      const response = await request(app)
        .get(
          "/media/aHR0cHM6Ly9zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9idWNrZXQvbWVkaWFfb2Zfbm9ybWFsX2J1Zy5qcGc="
        )
        .set("Authorization", "Bearer user");
      expect(response.status).toBe(302);
      expect(getPresignedUrl).toBeCalledTimes(1);
      expect(response.headers.location).toBe(
        "https://example.com/PRE_SIGNED_URL"
      );
    });
  });
  describe("GET /media/:id - only campaign access", () => {
    beforeAll(async () => {
      // permission on campaigns user_to_campaign
      await tryber.tables.WpAppqUserToCampaign.do().insert([
        {
          wp_user_id: 1,
          campaign_id: 1,
        },
      ]);
    });
    afterAll(async () => {
      await tryber.tables.WpAppqUserToCampaign.do().delete();
    });
    it("Should respond 302 if media that when base64 encoded matches id exists", async () => {
      //media of bug1 in cp1
      const response = await request(app)
        .get(
          "/media/aHR0cHM6Ly9zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9idWNrZXQvbWVkaWFfb2Zfbm9ybWFsX2J1Zy5qcGc="
        )
        .set("Authorization", "Bearer user");
      expect(response.status).toBe(302);
    });
    it("Should respond 302 and redirect to presigned url", async () => {
      //media of bug1 in cp1
      const response = await request(app)
        .get(
          "/media/aHR0cHM6Ly9zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9idWNrZXQvbWVkaWFfb2Zfbm9ybWFsX2J1Zy5qcGc="
        )
        .set("Authorization", "Bearer user");
      expect(response.status).toBe(302);
      expect(getPresignedUrl).toBeCalledTimes(1);
      expect(response.headers.location).toBe(
        "https://example.com/PRE_SIGNED_URL"
      );
    });
  });
  describe("GET /media/:id - no access to media", () => {
    beforeAll(async () => {
      await tryber.tables.WpAppqProject.do().insert([
        { id: 1, customer_id: 999, display_name: "Project 1", edited_by: 1 },
      ]);
      // permission on campaigns user_to_campaign
      await tryber.tables.WpAppqUserToCampaign.do().insert([
        {
          wp_user_id: 2,
          campaign_id: 1,
        },
      ]);
      await tryber.tables.WpAppqUserToCustomer.do().insert([
        {
          wp_user_id: 2,
          customer_id: 999,
        },
      ]);
      await tryber.tables.WpAppqUserToProject.do().insert([
        {
          project_id: 1,
          wp_user_id: 2,
        },
      ]);
    });
    afterAll(async () => {
      await tryber.tables.WpAppqUserToCampaign.do().delete();
      await tryber.tables.WpAppqUserToCustomer.do().delete();
      await tryber.tables.WpAppqProject.do().delete();
    });
    it("Should redirect to ErrorPage if logged in and user is unauthorized to workspace,project,campaign", async () => {
      //media of unauthorized bug5 in project
      const response = await request(app)
        .get(
          "/media/aHR0cHM6Ly9zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9idWNrZXQvbWVkaWFfb2Zfbm9ybWFsX2J1Zy5qcGc="
        )
        .set("Authorization", "Bearer user");
      expect(response.status).toBe(302);
      expect(getPresignedUrl).toBeCalledTimes(0);
      expect(response.headers.location).toBe("/media/oops");
    });
  });
});
