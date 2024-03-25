import app from "@src/app";
import { tryber, unguess } from "@src/features/database";
import request from "supertest";

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
  await tryber.tables.WpAppqUsecaseMediaTagType.do().insert([
    {
      id: 10,
      name: "Findings",
      campaign_id: 1,
    },
    {
      id: 11,
      name: "tag group",
      campaign_id: 1,
    },
    {
      id: 12,
      name: "tag group - no tags",
      campaign_id: 1,
    },
    {
      id: 13,
      name: "Group of other cp",
      campaign_id: 3,
    },
  ]);

  await tryber.tables.WpAppqUsecaseMediaObservationsTags.do().insert([
    {
      id: 2,
      name: "Tag1",
      style: "#eb7734",
      created_at: tryber.fn.now(),
      updated_at: tryber.fn.now(),
      type: 10,
    },
    {
      id: 13,
      name: "Tag2",
      style: "#9534eb",
      created_at: tryber.fn.now(),
      updated_at: tryber.fn.now(),
      type: 10,
    },
    {
      id: 14,
      name: "Tag3",
      style: "#9534eb",
      created_at: tryber.fn.now(),
      updated_at: tryber.fn.now(),
      type: 11,
    },
    {
      id: 16,
      name: "Tag group other cp",
      style: "#9534eb",
      created_at: tryber.fn.now(),
      updated_at: tryber.fn.now(),
      type: 13,
    },
  ]);

  await tryber.tables.WpAppqUsecaseMediaObservationsTagsLink.do().insert([
    { tag_id: 2, observation_id: 1 },
    { tag_id: 2, observation_id: 2 },
    { tag_id: 2, observation_id: 3 },
    { tag_id: 13, observation_id: 1 },
    { tag_id: 13, observation_id: 9 },
  ]);
});

describe("GET /campaigns/:campaignId/videoTags", () => {
  it("Should return 400 if campaign does not exist", async () => {
    const response = await request(app)
      .get("/campaigns/999/videoTags")
      .set("Authorization", "Bearer admin");
    expect(response.status).toBe(400);
  });
  it("Should return 403 if the user does not have enough permission", async () => {
    const response = await request(app)
      .get("/campaigns/2/videoTags")
      .set("Authorization", "Bearer tester");
    expect(response.status).toBe(403);
  });

  it("Should return 200 if the user have permission on CP", async () => {
    const response = await request(app)
      .get("/campaigns/1/videoTags")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should return 200 if the user is admin", async () => {
    const response = await request(app)
      .get("/campaigns/1/videoTags")
      .set("Authorization", "Bearer admin");
    expect(response.status).toBe(200);
  });

  it("Should return an array", async () => {
    const response = await request(app)
      .get("/campaigns/1/videoTags")
      .set("Authorization", "Bearer user");
    expect(response.body).toBeInstanceOf(Array);
  });
  it("Should return an array tag for each item", async () => {
    const response = await request(app)
      .get("/campaigns/1/videoTags")
      .set("Authorization", "Bearer user");
    expect(response.body[0].tags).toBeInstanceOf(Array);
    expect(response.body[1].tags).toBeInstanceOf(Array);
    expect(response.body[2].tags).toBeInstanceOf(Array);
  });

  it("Should return grouped tags for a specific campaign", async () => {
    const response = await request(app)
      .get("/campaigns/1/videoTags")
      .set("Authorization", "Bearer user");
    expect(response.body.length).toBe(3);
  });
  it("Should return tag-group data for a specific campaign", async () => {
    const response = await request(app)
      .get("/campaigns/1/videoTags")
      .set("Authorization", "Bearer user");
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          group: expect.objectContaining({
            id: 10,
            name: "Findings",
          }),
        }),
        expect.objectContaining({
          group: expect.objectContaining({
            id: 11,
            name: "tag group",
          }),
        }),
        expect.objectContaining({
          group: expect.objectContaining({
            id: 12,
            name: "tag group - no tags",
          }),
        }),
      ])
    );
  });
  it("Should return empty array if there are no tags releated to a group", async () => {
    const response = await request(app)
      .get("/campaigns/1/videoTags")
      .set("Authorization", "Bearer admin");
    expect(response.body[2].tags).toEqual([]);
  });

  it("Should return tag data of a specific campaign", async () => {
    const response = await request(app)
      .get("/campaigns/1/videoTags")
      .set("Authorization", "Bearer user");
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tags: expect.arrayContaining([
            expect.objectContaining({
              id: 2,
              name: "Tag1",
              color: "#eb7734",
              usageNumber: 3,
            }),
            expect.objectContaining({
              id: 13,
              name: "Tag2",
              color: "#9534eb",
              usageNumber: 2,
            }),
          ]),
        }),
        expect.objectContaining({
          tags: expect.arrayContaining([
            expect.objectContaining({
              id: 14,
              name: "Tag3",
              color: "#9534eb",
              usageNumber: 0,
            }),
          ]),
        }),
        expect.objectContaining({
          tags: expect.arrayContaining([]),
        }),
      ])
    );
  });
});

describe("GET /campaigns/:campaignId/videoTags - no tag groups", () => {
  beforeAll(async () => {
    await tryber.tables.WpAppqUsecaseMediaTagType.do().delete();
  });
  it("Should return empty array if there are no groups and no tags", async () => {
    const response = await request(app)
      .get("/campaigns/1/videoTags")
      .set("Authorization", "Bearer admin");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });
});
