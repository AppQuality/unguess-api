import app from "@src/app";
import { tryber, unguess } from "@src/features/database";
import request from "supertest";

const task = {
  campaign_id: 1,
  cluster_id: 10,
  title: "Campaign Task title",
  simple_title: "Campaign Task simple_title",
  content: "Campaign Task content",
  info: "Campaign Task info",
  prefix: "Campaign Task prefix",
  is_required: 1,
  jf_code: "Campaign Task jf_code",
  jf_text: "Campaign Task jf_text",
};

jest.mock("@src/features/checkUrl", () => ({
  checkUrl: jest.fn().mockImplementation(() => true),
}));

beforeAll(async () => {
  await tryber.tables.WpAppqEvdCampaign.do().insert([
    {
      id: 1,
      platform_id: 1,
      start_date: "2020-01-01",
      end_date: "2020-01-01",
      title: "This is the title",
      page_preview_id: 1,
      page_manual_id: 1,
      customer_id: 1,
      pm_id: 1,
      project_id: 999,
      customer_title: "",
      campaign_pts: 200,
    },
    {
      id: 2,
      platform_id: 1,
      start_date: "2020-01-01",
      end_date: "2020-01-01",
      title: "No access to this Campaign",
      page_preview_id: 1,
      page_manual_id: 1,
      customer_id: 1,
      pm_id: 1,
      project_id: 1,
      customer_title: "",
      campaign_pts: 200,
    },
  ]);
  await tryber.tables.WpAppqUserToCampaign.do().insert({
    wp_user_id: 1,
    campaign_id: 1,
  });
  await tryber.tables.WpAppqProject.do().insert({
    id: 999,
    display_name: "Project 999",
    customer_id: 1,
    edited_by: 1,
  });
  await tryber.tables.WpAppqUserToProject.do().insert({
    wp_user_id: 1,
    project_id: 999,
  });
  await unguess.tables.WpUnguessUserToCustomer.do().insert({
    unguess_wp_user_id: 1,
    tryber_wp_user_id: 1,
    profile_id: 1,
  });
  await tryber.tables.WpAppqCustomer.do().insert({
    id: 1,
    company: "Company",
    company_logo: "logo.png",
    tokens: 100,
    pm_id: 1,
  });
  await tryber.tables.WpAppqEvdProfile.do().insert([
    {
      id: 1,
      wp_user_id: 1,
      name: "Tester1",
      email: "jhon.doe@tryber.me",
      employment_id: 1,
      education_id: 1,
    },
    {
      id: 2,
      wp_user_id: 2,
      name: "Tester2",
      email: "jhon.doe@tryber.me",
      employment_id: 1,
      education_id: 1,
    },
  ]);

  await tryber.tables.WpAppqUserTaskMedia.do().insert([
    {
      id: 1,
      campaign_task_id: 10,
      user_task_id: 1,
      tester_id: 1,
      status: 2,
      location:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
    {
      id: 2,
      campaign_task_id: 20,
      user_task_id: 1,
      tester_id: 2,
      status: 2,
      location:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
    {
      id: 3,
      campaign_task_id: 30,
      user_task_id: 1,
      tester_id: 2,
      status: 2,
      location:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
    {
      id: 4,
      campaign_task_id: 30,
      user_task_id: 1,
      tester_id: 1,
      status: 0,
      location:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
  ]);
  await tryber.tables.WpAppqCampaignTask.do().insert([
    {
      ...task,
      id: 10,
      campaign_id: 1,
    },
    {
      ...task,
      id: 20,
      campaign_id: 2,
    },
    {
      ...task,
      id: 30,
      campaign_id: 1,
      cluster_id: 30,
    },
  ]);
});
describe("GET /campaigns/:campaignId/video", () => {
  it("Should return 400 if campaign does not exist", async () => {
    const response = await request(app)
      .get("/campaigns/999/video")
      .set("Authorization", "Bearer admin");
    expect(response.status).toBe(400);
  });
  it("Should return 403 if the user does not have enough permission", async () => {
    const response = await request(app)
      .get("/campaigns/2/video")
      .set("Authorization", "Bearer tester");
    expect(response.status).toBe(403);
  });

  it("Should return 200 if the user have permission on CP", async () => {
    const response = await request(app)
      .get("/campaigns/1/video")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should return 200 if the user is admin", async () => {
    const response = await request(app)
      .get("/campaigns/1/video")
      .set("Authorization", "Bearer admin");
    expect(response.status).toBe(200);
  });

  it("Should return items array", async () => {
    const response = await request(app)
      .get("/campaigns/1/video")
      .set("Authorization", "Bearer user");
    expect(response.body).toHaveProperty("items");
    expect(response.body.items).toBeInstanceOf(Array);
  });

  it("Should return publish gruped video by usecase  of a specific campaign", async () => {
    const response = await request(app)
      .get("/campaigns/1/video")
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(2);
  });
  it("Should return items with usecases", async () => {
    const response = await request(app)
      .get("/campaigns/1/video")
      .set("Authorization", "Bearer user");
    expect(response.body.items[0]).toEqual(
      expect.objectContaining({
        usecase: expect.objectContaining({
          id: expect.any(Number),
          title: expect.any(String),
          description: expect.any(String),
        }),
      })
    );
  });
  it("Should return items with usecases data", async () => {
    const response = await request(app)
      .get("/campaigns/1/video")
      .set("Authorization", "Bearer user");
    expect(response.body.items[0]).toEqual(
      expect.objectContaining({
        usecase: expect.objectContaining({
          id: 10,
          title: "Campaign Task title",
          description: "Campaign Task content",
        }),
      })
    );
    expect(response.body.items[1]).toEqual(
      expect.objectContaining({
        usecase: expect.objectContaining({
          id: 30,
          title: "Campaign Task title",
          description: "Campaign Task content",
        }),
      })
    );
  });
  it("Should return items with videos", async () => {
    const response = await request(app)
      .get("/campaigns/1/video")
      .set("Authorization", "Bearer user");
    expect(response.body.items[0]).toEqual(
      expect.objectContaining({
        videos: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            streamUrl: expect.any(String),
            url: expect.any(String),
          }),
        ]),
      })
    );
  });
  it("Should return items with videos data", async () => {
    const response = await request(app)
      .get("/campaigns/1/video")
      .set("Authorization", "Bearer user");
    expect(response.body.items[0]).toEqual(
      expect.objectContaining({
        videos: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            streamUrl:
              "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny-stream.m3u8",
          }),
        ]),
      })
    );
    expect(response.body.items[1]).toEqual(
      expect.objectContaining({
        videos: expect.arrayContaining([
          expect.objectContaining({
            id: 3,
            url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            streamUrl:
              "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny-stream.m3u8",
          }),
        ]),
      })
    );
  });

  it("Should return videos with tester", async () => {
    const response = await request(app)
      .get("/campaigns/1/video")
      .set("Authorization", "Bearer user");
    expect(response.body.items[0]).toEqual(
      expect.objectContaining({
        videos: expect.arrayContaining([
          expect.objectContaining({
            tester: expect.objectContaining({
              id: expect.any(Number),
              name: expect.any(String),
            }),
          }),
        ]),
      })
    );
  });
  it("Should return videos with tester data", async () => {
    const response = await request(app)
      .get("/campaigns/1/video")
      .set("Authorization", "Bearer user");
    expect(response.body.items[0]).toEqual(
      expect.objectContaining({
        videos: expect.arrayContaining([
          expect.objectContaining({
            tester: expect.objectContaining({
              id: 1,
              name: "Tester1",
            }),
          }),
        ]),
      })
    );
    expect(response.body.items[1]).toEqual(
      expect.objectContaining({
        videos: expect.arrayContaining([
          expect.objectContaining({
            tester: expect.objectContaining({
              id: 2,
              name: "Tester2",
            }),
          }),
        ]),
      })
    );
  });
});

describe("GET /campaigns/:campaignId/video - there are no video", () => {
  beforeAll(async () => {
    await tryber.tables.WpAppqUserTaskMedia.do().delete();
  });
  it("Should return items array", async () => {
    const response = await request(app)
      .get("/campaigns/1/video")
      .set("Authorization", "Bearer user");
    expect(response.body).toHaveProperty("items");
    expect(response.body.items[0].videos).toBeInstanceOf(Array);
    expect(response.body.items[1].videos).toBeInstanceOf(Array);
  });

  it("Should return items with video as empty array if there are no media", async () => {
    const response = await request(app)
      .get("/campaigns/1/video")
      .set("Authorization", "Bearer user");
    expect(response.body).toHaveProperty("items");
    expect(response.body.items[0].videos).toEqual([]);
    expect(response.body.items[1].videos).toEqual([]);
  });
});

describe("GET /campaigns/:campaignId/video - there are no usecases", () => {
  beforeAll(async () => {
    await tryber.tables.WpAppqCampaignTask.do().delete();
  });
  it("Should return items array", async () => {
    const response = await request(app)
      .get("/campaigns/1/video")
      .set("Authorization", "Bearer user");
    expect(response.body).toHaveProperty("items");
    expect(response.body.items).toBeInstanceOf(Array);
  });

  it("Should return items with video as empty array if there are no media", async () => {
    const response = await request(app)
      .get("/campaigns/1/video")
      .set("Authorization", "Bearer user");
    expect(response.body).toHaveProperty("items");
    expect(response.body.items).toEqual([]);
  });
});
