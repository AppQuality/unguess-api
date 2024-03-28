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
      id: 11,
      campaign_task_id: 10,
      user_task_id: 1,
      tester_id: 2,
      status: 0,
      location:
        "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    },
    {
      id: 12,
      campaign_task_id: 11,
      user_task_id: 1,
      tester_id: 2,
      status: 2,
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
      id: 11,
      campaign_id: 2,
    },
  ]);
});

describe("POST /video/:vid/observations", () => {
  beforeEach(async () => {
    await tryber.tables.WpAppqUsecaseMediaObservations.do().delete();
  });
  it("Should return 400 if video does not exist", async () => {
    const response = await request(app)
      .post("/video/99999/observations")
      .send({
        title: "observation name",
        description: "observation description",
        start: 0,
        end: 0,
      })
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });
  it("Should return 400 if the user post an observation of a not publish video", async () => {
    const response = await request(app)
      .post("/video/11/observations")
      .send({
        start: 0,
        end: 0,
      })
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });
  it("Should return 403 if the user post an observation of a not accesible video", async () => {
    const response = await request(app)
      .post("/video/12/observations")
      .send({
        start: 0,
        end: 0,
      })
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(403);
  });
  it("Should return 200 if the user is admin", async () => {
    const response = await request(app)
      .post("/video/10/observations")
      .send({
        start: 0,
        end: 0,
      })
      .set("Authorization", "Bearer admin");
    expect(response.status).toBe(200);
  });
  it("Should return observation id", async () => {
    const response = await request(app)
      .post("/video/10/observations")
      .send({
        start: 2,
        end: 10,
      })
      .set("Authorization", "Bearer user");
    expect(response.body).toBeInstanceOf(Object);
    expect(response.body).toEqual(
      expect.objectContaining({ id: expect.any(Number) })
    );
  });
  it("Should return observation title", async () => {
    const response = await request(app)
      .post("/video/10/observations")
      .send({
        start: 2,
        end: 10,
      })
      .set("Authorization", "Bearer user");
    expect(response.body).toEqual(
      expect.objectContaining({ title: expect.any(String) })
    );
    expect(response.body).toEqual(expect.objectContaining({ title: "" }));
  });
  it("Should return observation description", async () => {
    const response = await request(app)
      .post("/video/10/observations")
      .send({
        start: 2,
        end: 10,
      })
      .set("Authorization", "Bearer user");
    expect(response.body).toEqual(
      expect.objectContaining({ description: expect.any(String) })
    );
    expect(response.body).toEqual(expect.objectContaining({ description: "" }));
  });
  it("Should return observation start", async () => {
    const response = await request(app)
      .post("/video/10/observations")
      .send({
        start: 2,
        end: 10,
      })
      .set("Authorization", "Bearer user");
    expect(response.body).toEqual(
      expect.objectContaining({ start: expect.any(Number) })
    );
    expect(response.body).toEqual(expect.objectContaining({ start: 2 }));
  });
  it("Should return observation end", async () => {
    const response = await request(app)
      .post("/video/10/observations")
      .send({
        start: 2,
        end: 10,
      })
      .set("Authorization", "Bearer user");
    expect(response.body).toEqual(
      expect.objectContaining({ end: expect.any(Number) })
    );
    expect(response.body).toEqual(expect.objectContaining({ end: 10 }));
  });
});

describe("POST /video/:vid/observations - there are no video", () => {
  beforeAll(async () => {
    await tryber.tables.WpAppqUserTaskMedia.do().delete();
  });
  it("Should return 400 if there are no video", async () => {
    const response = await request(app)
      .post("/video/10/observations")
      .send({
        start: 0,
        end: 0,
      })
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });
});
