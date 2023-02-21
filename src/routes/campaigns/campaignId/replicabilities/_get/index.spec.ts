import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import replicability from "@src/__mocks__/database/bug_replicability";
import customReplicabilities from "@src/__mocks__/database/bug_replicability_custom";
import bugs from "@src/__mocks__/database/bugs";
import bugStatus from "@src/__mocks__/database/bug_status";

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
    await dbAdapter.addCampaignWithProject({
      campaign_id: 3,
      project_id: 1,
      customer_id: 1,
      wp_user_id: 1,
    });
    await dbAdapter.addCampaignWithProject({
      campaign_id: 4,
      project_id: 1,
      customer_id: 1,
      wp_user_id: 1,
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
    customReplicabilities.insert({
      id: 3,
      campaign_id: 4,
      bug_replicability_id: 3,
    });
    bugStatus.addDefaultItems();
    await bugs.insert({
      id: 1,
      bug_replicability_id: 2,
      campaign_id: 4,
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

  it("Should fail if the user is not the owner", async () => {
    const response = await request(app)
      .get(`/campaigns/2/replicabilities`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(403);
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

  it("Should return all campaign replicabilities if campaign has not custom replicability", async () => {
    const response = await request(app)
      .get(`/campaigns/3/replicabilities`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 1,
        name: "Sometimes",
      },
      {
        id: 2,
        name: "Always",
      },
      {
        id: 3,
        name: "Once",
      },
    ]);
  });

  it("Should return bug replicabilities even if not available in list", async () => {
    const response = await request(app)
      .get(`/campaigns/4/replicabilities`)
      .set("Authorization", "Bearer user");
    expect(response.body).toEqual([
      {
        id: 3,
        name: "Once",
      },
      {
        id: 2,
        name: "Always",
      },
    ]);
  });
});
