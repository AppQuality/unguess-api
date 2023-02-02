import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
describe("POST /analytics/views/campaigns/{cid}", () => {
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
  });

  it("Should return 403 if user is not authenticated", async () => {
    const response = await request(app).post("/analytics/views/campaigns/1");
    expect(response.status).toBe(403);
  });

  it("Should return 400 if campaign does not exists", async () => {
    const response = await request(app)
      .post("/analytics/views/campaigns/999")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should return 403 if campaign exists but user has no access", async () => {
    const response = await request(app)
      .post("/analytics/views/campaigns/2")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  it("Should return 200 if campaign exists and user has access", async () => {
    const response = await request(app)
      .post("/analytics/views/campaigns/1")
      .set("Authorization", "Bearer user");
    console.log(response.body);
    expect(response.status).toBe(200);
  });
});
