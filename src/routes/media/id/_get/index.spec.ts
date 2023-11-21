import app from "@src/app";
import { tryber } from "@src/features/database";
import request from "supertest";
import { getPresignedUrl } from "@src/features/s3/getPresignedUrl";

const customer_1 = {
  id: 999,
  company: "Company 999",
  company_logo: "logo999.png",
  tokens: 100,
  pm_id: 1,
};
const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 999,
};
const project_1 = {
  id: 999,
  display_name: "Project 999",
  customer_id: 999,
  edited_by: 666,
};
const user_to_project_1 = {
  wp_user_id: 1,
  project_id: 999,
};
const user_to_campaign_1 = {
  wp_user_id: 1,
  campaign_id: 1,
};
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
  project_id: project_1.id,
  base_bug_internal_id: "CP01",
  platform_id: 1,
  page_preview_id: 1,
  page_manual_id: 1,
  customer_id: 1,
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
    await tryber.tables.WpAppqCustomer.do().insert(customer_1); //companies
    await tryber.tables.WpAppqUserToCustomer.do().insert(user_to_customer_1); //user to companies
    await tryber.tables.WpAppqUserToCampaign.do().insert([
      user_to_campaign_1,
      {
        //user not authorized to project
        wp_user_id: 1,
        campaign_id: 3,
      },
    ]);
    //projects
    await tryber.tables.WpAppqProject.do().insert([
      project_1,
      { ...project_1, id: 2, customer_id: 1 },
    ]);
    await tryber.tables.WpAppqUserToProject.do().insert([
      user_to_project_1,
      { wp_user_id: 1, project_id: 1000 },
    ]);
    await tryber.tables.WpAppqEvdCampaign.do().insert([
      campaign_1,
      { ...campaign_1, id: 2 },
      { ...campaign_1, id: 3, project_id: 2 },
    ]);

    await tryber.tables.WpAppqEvdBug.do().insert([
      bug_1, //normal bug - CP1
      { ...bug_1, id: 2 }, //public bug - CP1
      { ...bug_1, id: 3, campaign_id: 2 }, //unauthorized bug to cp - CP2
      { ...bug_1, id: 4, campaign_id: 3 }, //unauthorized bug to project - CP3
    ]);
    await tryber.tables.WpAppqEvdBugMedia.do().insert([
      {
        id: 1,
        bug_id: 1,
        location: "https://s3.eu-west-1.amazonaws.com/bucket/key.jpg",
      },
      {
        id: 2,
        bug_id: 2,
        location:
          "https://s3.eu-west-1.amazonaws.com/bucket/public_bug_media.jpg",
      },
      {
        id: 3,
        bug_id: 3,
        location:
          "https://s3.eu-west-1.amazonaws.com/bucket/unauthorized_bug_media.jpg",
      },
    ]);
    await tryber.tables.WpAppqBugLink.do().insert({
      id: 1,
      bug_id: 2,
      expiration: 1,
      creation_date: "2021-01-01 00:00:00",
    });
  });
  afterAll(async () => {
    await tryber.tables.WpAppqEvdBugMedia.do().delete();
    await tryber.tables.WpAppqEvdBug.do().delete();
    await tryber.tables.WpAppqBugLink.do().delete();
    await tryber.tables.WpAppqEvdCampaign.do().delete();
    await tryber.tables.WpAppqUserToCampaign.do().delete();
    await tryber.tables.WpAppqUserToProject.do().delete();
    await tryber.tables.WpAppqUserToCustomer.do().delete();
    await tryber.tables.WpAppqProject.do().delete();
    await tryber.tables.WpAppqCustomer.do().delete();
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
    //media of bug1 in cp1
    const response = await request(app)
      .get(
        "/media/aHR0cHM6Ly9zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9idWNrZXQva2V5LmpwZw=="
      )
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(302);
  });

  it("Should respond 302 and redirect to presigned url", async () => {
    //media of bug1 in cp1
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

  it("Should redirect to presigned url if logged out and bug is public", async () => {
    //media of public bug2 in cp1
    const response = await request(app).get(
      "/media/aHR0cHM6Ly9zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9idWNrZXQvcHVibGljX2J1Z19tZWRpYS5qcGc="
    );
    expect(response.status).toBe(302);
    expect(getPresignedUrl).toBeCalledTimes(1);
    expect(response.headers.location).toBe(
      "https://example.com/PRE_SIGNED_URL"
    );
  });

  it("Should redirect to ErrorPage if logged in and user is unauthorized to campaign", async () => {
    //media of unauthorize bug3 in cp2
    const response = await request(app)
      .get(
        "/media/aHR0cHM6Ly9zMy5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbS9idWNrZXQvdW5hdXRob3JpemVkX2J1Z19tZWRpYS5qcGc="
      )
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(302);
    expect(getPresignedUrl).toBeCalledTimes(0);
    expect(response.headers.location).toBe("https://app.unguess.io/error");
  });
});
