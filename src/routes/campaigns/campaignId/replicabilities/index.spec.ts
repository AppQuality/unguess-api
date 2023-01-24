import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import replicability from "@src/__mocks__/database/bug_replicability";
import customReplicabilities from "@src/__mocks__/database/bug_replicability_custom";

describe("GET /campaigns/{cid}/replicabilities", () => {
  beforeAll(async () => {
    await dbAdapter.addCampaignWithProject({
      campaign_id: 1,
      project_id: 1,
      customer_id: 1,
      wp_user_id: 1,
    });
    await dbAdapter.addCampaignWithProject({
      campaign_id: 2,
      project_id: 2,
      customer_id: 2,
      wp_user_id: 2,
    });
    replicability.addDefaultItems();
    customReplicabilities.insert({
      id: 1,
      campaign_id: 1,
      bug_replicability_id: 1,
    });
    customReplicabilities.insert({
      id: 2,
      campaign_id: 2,
      bug_replicability_id: 1,
    });
  });

  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).get("/campaigns/1/replicabilities");
    expect(response.status).toBe(403);
  });

  it("Should answer 400 if campaign does not exists", async () => {
    const response = await request(app)
      .get("/campaigns/100/replicabilities")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should answer 200 if campaign exists and user has access", async () => {
    const response = await request(app)
      .get("/campaigns/1/replicabilities")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should return custom replicabilities", async () => {
    const response = await request(app)
      .get("/campaigns/1/replicabilities")
      .set("Authorization", "Bearer user");
    expect(response.body).toEqual([
      {
        id: 1,
        name: "Sometimes",
      },
    ]);
  });
});
