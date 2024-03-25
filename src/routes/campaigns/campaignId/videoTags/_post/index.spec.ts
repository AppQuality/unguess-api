import app from "@src/app";
import { tryber, unguess } from "@src/features/database";
import { af } from "date-fns/locale";
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
});
afterEach(async () => {
  await tryber.tables.WpAppqUsecaseMediaObservationsTags.do().delete();
  await tryber.tables.WpAppqUsecaseMediaTagType.do().delete();
});

describe("GET /campaigns/:campaignId/video-tags", () => {
  it("Should return 400 if campaign does not exist", async () => {
    const response = await request(app)
      .post("/campaigns/999/video-tags")
      .set("Authorization", "Bearer admin");
    expect(response.status).toBe(400);
  });
  it("Should return 403 if the user does not have enough permission", async () => {
    const response = await request(app)
      .post("/campaigns/2/video-tags")
      .set("Authorization", "Bearer tester");
    expect(response.status).toBe(403);
  });

  it("Should return 200 if the user have permission on CP", async () => {
    const response = await request(app)
      .post("/campaigns/1/video-tags")
      .set("Authorization", "Bearer user")
      .send({ group: { name: "Findings" }, tag: { name: "positive" } });
    expect(response.status).toBe(200);
  });

  it("Should return 200 if the user is admin", async () => {
    const response = await request(app)
      .post("/campaigns/1/video-tags")
      .set("Authorization", "Bearer admin")
      .send({ group: { name: "Findings" }, tag: { name: "positive" } });
    expect(response.status).toBe(200);
  });

  it("Should return an error if try to send a group id of an onther cp", async () => {
    await tryber.tables.WpAppqUsecaseMediaTagType.do().insert({
      id: 255,
      name: "Findings",
      campaign_id: 2,
    });
    const response = await request(app)
      .post("/campaigns/1/video-tags")
      .set("Authorization", "Bearer admin")
      .send({
        group: { id: 255, name: "Findings" },
        tag: { name: "positive" },
      });
    expect(response.status).toBe(400);
  });

  it("Should return an error if try to send a non-existent group-id", async () => {
    const response = await request(app)
      .post("/campaigns/1/video-tags")
      .set("Authorization", "Bearer admin")
      .send({
        group: { id: 12345, name: "Findings" },
        tag: { name: "positive" },
      });
    expect(response.status).toBe(400);
  });

  it("Should return an error if try to send a group name empty", async () => {
    const response = await request(app)
      .post("/campaigns/1/video-tags")
      .set("Authorization", "Bearer admin")
      .send({ group: { name: "" }, tag: { name: "positive" } });
    expect(response.status).toBe(400);
  });

  it("Should insert tag to releated to an existing group if send group id", async () => {
    await tryber.tables.WpAppqUsecaseMediaTagType.do().insert({
      id: 10,
      name: "Findings",
      campaign_id: 1,
    });
    const tagswBefore =
      await tryber.tables.WpAppqUsecaseMediaObservationsTags.do().select();
    expect(tagswBefore.length).toBe(0);
    const response = await request(app)
      .post("/campaigns/1/video-tags")
      .set("Authorization", "Bearer admin")
      .send({
        group: { id: 10, name: "Findings" },
        tag: { name: "positive", style: "#eb57cd" },
      });
    expect(response.status).toBe(200);
    const tagsAfter =
      await tryber.tables.WpAppqUsecaseMediaObservationsTags.do().select();
    expect(tagsAfter.length).toBe(1);
    expect(tagsAfter[0]).toEqual(
      expect.objectContaining({
        name: "positive",
        type: 10,
        style: "#eb57cd",
      })
    );
  });

  it("Should insert tag with style white if don't send style", async () => {
    await tryber.tables.WpAppqUsecaseMediaTagType.do().insert({
      id: 10,
      name: "Findings",
      campaign_id: 1,
    });
    const tagswBefore =
      await tryber.tables.WpAppqUsecaseMediaObservationsTags.do().select();
    expect(tagswBefore.length).toBe(0);
    const response = await request(app)
      .post("/campaigns/1/video-tags")
      .set("Authorization", "Bearer admin")
      .send({ group: { id: 10, name: "Findings" }, tag: { name: "positive" } });
    expect(response.status).toBe(200);
    const tagsAfter =
      await tryber.tables.WpAppqUsecaseMediaObservationsTags.do().select();
    expect(tagsAfter.length).toBe(1);
    expect(tagsAfter[0]).toEqual(
      expect.objectContaining({
        name: "positive",
        type: 10,
        style: "white",
      })
    );
  });

  it("Should insert tag and create a group if don't send a group id", async () => {
    const tagswBefore =
      await tryber.tables.WpAppqUsecaseMediaObservationsTags.do().select();
    expect(tagswBefore.length).toBe(0);
    const groupsBefore =
      await tryber.tables.WpAppqUsecaseMediaTagType.do().select();
    expect(groupsBefore.length).toBe(0);
    const response = await request(app)
      .post("/campaigns/1/video-tags")
      .set("Authorization", "Bearer admin")
      .send({ group: { name: "Findings" }, tag: { name: "positive" } });
    expect(response.status).toBe(200);
    const tagsAfter =
      await tryber.tables.WpAppqUsecaseMediaObservationsTags.do().select();
    expect(tagsAfter.length).toBe(1);
    const groupsAfter =
      await tryber.tables.WpAppqUsecaseMediaTagType.do().select();
    expect(groupsAfter.length).toBe(1);
    expect(groupsAfter[0]).toEqual(
      expect.objectContaining({
        name: "Findings",
        campaign_id: 1,
      })
    );
  });
});
