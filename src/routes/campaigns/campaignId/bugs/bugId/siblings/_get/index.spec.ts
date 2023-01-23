import app from "@src/app";
import request from "supertest";
import { adapter } from "@src/__mocks__/database/companyAdapter";
import bugStatus from "@src/__mocks__/database/bug_status";
import bugs from "@src/__mocks__/database/bugs";
import CampaignMeta from "@src/__mocks__/database/campaign_meta";

describe("GET /campaigns/{cid}/bugs/{bid}/sibilings", () => {
  beforeAll(async () => {
    await bugStatus.addDefaultItems();
    await adapter.addCampaignWithProject({
      campaign_id: 1,
      project_id: 1,
      customer_id: 1,
      wp_user_id: 1,
    });
    await CampaignMeta.insert({
      meta_id: 1,
      campaign_id: 1,
      meta_key: "bug_title_rule",
      meta_value: "1",
    });
    await adapter.addCampaignWithProject({
      campaign_id: 2,
      project_id: 2,
      customer_id: 2,
      wp_user_id: 2,
    });
    bugs.insert({
      id: 1,
      campaign_id: 1,
    });
    bugs.insert({
      id: 2,
      message: "[CONTEXT] - father",
      campaign_id: 1,
      is_duplicated: 0,
    });
    bugs.insert({
      id: 3,
      campaign_id: 1,
      is_duplicated: 1,
      duplicated_of_id: 2,
    });
  });

  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).get("/campaigns/1/bugs/1/siblings");
    expect(response.status).toBe(403);
  });

  it("Should answer 400 if campaign does not exists", async () => {
    const response = await request(app)
      .get("/campaigns/100/bugs/1/siblings")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should answer 400 if bug does not exists", async () => {
    const response = await request(app)
      .get("/campaigns/1/bugs/10/siblings")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should answer 200 if campaign exists and user has access", async () => {
    const response = await request(app)
      .get("/campaigns/1/bugs/2/siblings")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should answer 404 if there are no siblings", async () => {
    const response = await request(app)
      .get("/campaigns/1/bugs/1/siblings")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(404);
  });

  it("Should answer with the father id and name if is a child", async () => {
    const response = await request(app)
      .get("/campaigns/1/bugs/3/siblings")
      .set("Authorization", "Bearer user");
    expect(response.body).toHaveProperty("father");
    expect(response.body.father).toEqual(
      expect.objectContaining({
        id: 2,
        title: {
          full: "[CONTEXT] - father",
          compact: "father",
          context: ["CONTEXT"],
        },
      })
    );
  });
});
