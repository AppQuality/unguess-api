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
      id: 10,
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
      campaign_task_id: 10,
      user_task_id: 1,
      tester_id: 2,
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
  ]);
  await tryber.tables.WpAppqUsecaseMediaObservations.do().insert([
    {
      id: 100,
      media_id: 10,
      name: "observation name",
      description: "observation description",
      ux_note: "ux note",
      video_ts: 10,
      updated_at: "2024-03-18 15:58:50",
    },
    {
      media_id: 10,
      name: "observation name2",
      description: "observation description2",
      ux_note: "ux note2",
      video_ts: 11,
      updated_at: "2022-03-18 15:58:50",
    },
    {
      media_id: 2,
      name: "observation name",
      description: "observation description",
      ux_note: "ux note",
      video_ts: 10,
      updated_at: "2024-03-18 15:58:50",
    },
    {
      media_id: 3,
      name: "observation of not visible video",
      description: "observation description2",
      ux_note: "ux note",
      video_ts: 10,
      updated_at: "2021-03-18 15:58:50",
    },
  ]);
  await tryber.tables.WpAppqUsecaseMediaObservationsTags.do().insert([
    { id: 1, name: "positive", style: "white", type: 1 },
    { id: 2, name: "negative", style: "purple", type: 2 },
    { id: 3, name: "never-used-tag", style: "red", type: 1 },
    { id: 4, name: "tag-other-cp", style: "red", type: 3 },
  ]);
  await tryber.tables.WpAppqUsecaseMediaTagType.do().insert([
    { id: 1, name: "Findings", campaign_id: 1 },
    { id: 2, name: "Bad", campaign_id: 1 },
    { id: 3, name: "TagGroup CP2", campaign_id: 2 },
  ]);
  await tryber.tables.WpAppqUsecaseMediaObservationsTagsLink.do().insert([
    { id: 1, tag_id: 1, observation_id: 100 },
    { id: 2, tag_id: 1, observation_id: 99 },
    { id: 3, tag_id: 2, observation_id: 100 },
    { id: 4, tag_id: 4, observation_id: 666 },
  ]);
});

describe("GET /video/:vid/observations", () => {
  it("Should return 400 if video does not exist", async () => {
    const response = await request(app)
      .get("/video/99999/observations")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });
  it("Should return 403 if the user try to get observations of a not accesible video", async () => {
    const response = await request(app)
      .get("/video/2/observations")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(403);
  });
  it("Should return 200 if the user is admin", async () => {
    const response = await request(app)
      .get("/video/10/observations")
      .set("Authorization", "Bearer admin");
    expect(response.status).toBe(200);
  });
  it("Should return an array", async () => {
    const response = await request(app)
      .get("/video/10/observations")
      .set("Authorization", "Bearer user");
    expect(response.body).toBeInstanceOf(Array);
    expect(response.body.length).toBe(2);
  });
  it("Should return observations with id as number", async () => {
    const response = await request(app)
      .get("/video/10/observations")
      .set("Authorization", "Bearer user");
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: expect.any(Number) }),
      ])
    );
  });
  it("Should return observations with title as string", async () => {
    const response = await request(app)
      .get("/video/10/observations")
      .set("Authorization", "Bearer user");
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: expect.any(String) }),
      ])
    );
  });
  it("Should return observations with description as string", async () => {
    const response = await request(app)
      .get("/video/10/observations")
      .set("Authorization", "Bearer user");
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ description: expect.any(String) }),
      ])
    );
  });
  it("Should return observations with start as number", async () => {
    const response = await request(app)
      .get("/video/10/observations")
      .set("Authorization", "Bearer user");
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ start: expect.any(Number) }),
      ])
    );
  });
  it("Should return observations with end as number", async () => {
    const response = await request(app)
      .get("/video/10/observations")
      .set("Authorization", "Bearer user");
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ end: expect.any(Number) }),
      ])
    );
  });
  it("Should return observations with tags as array", async () => {
    const response = await request(app)
      .get("/video/10/observations")
      .set("Authorization", "Bearer user");
    expect(response.body[0]).toHaveProperty("tags");
    expect(response.body[0].tags).toBeInstanceOf(Array);
    expect(response.body[1]).toHaveProperty("tags");
    expect(response.body[1].tags).toBeInstanceOf(Array);
  });
  it("Should return observations", async () => {
    const response = await request(app)
      .get("/video/10/observations")
      .set("Authorization", "Bearer user");
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 100,
          title: "observation name",
          description: "observation description",
          start: 0,
          end: 0,
        }),
        expect.objectContaining({
          id: 101,
          title: "observation name2",
          description: "observation description2",
          start: 0,
          end: 0,
        }),
      ])
    );
  });
  it("Should return observations tags", async () => {
    const response = await request(app)
      .get("/video/10/observations")
      .set("Authorization", "Bearer user");
    console.log(response.body[0].tags);
    console.log(response.body[1].tags);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tags: expect.arrayContaining([
            expect.objectContaining({
              group: { id: 1, name: "Findings" },
              tag: { id: 1, name: "positive", style: "white", usageNumber: 2 },
            }),
            expect.objectContaining({
              group: { id: 2, name: "Bad" },
              tag: { id: 2, name: "negative", style: "purple", usageNumber: 1 },
            }),
          ]),
        }),
      ])
    );
  });

  it("Should return observations with empty tags if there are no tags", async () => {
    const response = await request(app)
      .get("/video/10/observations")
      .set("Authorization", "Bearer user");
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tags: [],
        }),
      ])
    );
  });
});

// describe("GET /video/:vid/observations - there are no video", () => {
//   beforeAll(async () => {
//     await tryber.tables.WpAppqUserTaskMedia.do().delete();
//   });
//   it("Should return items array", async () => {
//     const response = await request(app)
//       .get("/video/1/observations")
//       .set("Authorization", "Bearer user");
//     expect(response.body).toHaveProperty("items");
//     expect(response.body.items[0].videos).toBeInstanceOf(Array);
//     expect(response.body.items[1].videos).toBeInstanceOf(Array);
//   });

//   it("Should return items with video as empty array if there are no media", async () => {
//     const response = await request(app)
//       .get("/video/1/observations")
//       .set("Authorization", "Bearer user");
//     expect(response.body).toHaveProperty("items");
//     expect(response.body.items[0].videos).toEqual([]);
//     expect(response.body.items[1].videos).toEqual([]);
//   });
// });

// describe("GET /video/:vid/observations - there are no usecases", () => {
//   beforeAll(async () => {
//     await tryber.tables.WpAppqCampaignTask.do().delete();
//   });
//   it("Should return items array", async () => {
//     const response = await request(app)
//       .get("/video/1/observations")
//       .set("Authorization", "Bearer user");
//     expect(response.body).toHaveProperty("items");
//     expect(response.body.items).toBeInstanceOf(Array);
//   });

//   it("Should return items with video as empty array if there are no media", async () => {
//     const response = await request(app)
//       .get("/video/1/observations")
//       .set("Authorization", "Bearer user");
//     expect(response.body).toHaveProperty("items");
//     expect(response.body.items).toEqual([]);
//   });
// });
