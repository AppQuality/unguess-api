import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { unguess } from "@src/features/database";

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
  afterEach(async () => {
    await unguess.tables.WpUgCampaignReadStatus.do().delete();
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
    console.log(response.body);
    expect(response.status).toBe(403);
  });

  it("Should return 200 if campaign exists and user has access", async () => {
    const response = await request(app)
      .post("/analytics/views/campaigns/1")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should create a read status on view", async () => {
    const itemsBeforePost =
      await unguess.tables.WpUgCampaignReadStatus.do().select("campaign_id");
    expect(itemsBeforePost.length, "There should be no views before post").toBe(
      0
    );
    const response = await request(app)
      .post("/analytics/views/campaigns/1")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);

    const itemsAfterPost = await unguess.tables.WpUgCampaignReadStatus.do()
      .select("campaign_id")
      .select("unguess_wp_user_id");
    expect(
      itemsAfterPost.length,
      "There should be a single view after post"
    ).toBe(1);

    const item = itemsAfterPost[0];
    expect(item.campaign_id, "Should set campaign 1 as viewed").toBe(1);
    expect(item.unguess_wp_user_id, "Should set viewed from user 1").toBe(1);
  });

  it("Should not insert a read status if already exists", async () => {
    const itemsBeforePost =
      await unguess.tables.WpUgCampaignReadStatus.do().select();
    expect(itemsBeforePost.length, "There should be no views before post").toBe(
      0
    );
    const response = await request(app)
      .post("/analytics/views/campaigns/1")
      .set("Authorization", "Bearer user");

    const itemsAfterFirstPost =
      await unguess.tables.WpUgCampaignReadStatus.do().select();
    expect(
      itemsAfterFirstPost.length,
      "There should be a single view after first post"
    ).toBe(1);

    await request(app)
      .post("/analytics/views/campaigns/1")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);

    const itemsAfterSecondPost =
      await unguess.tables.WpUgCampaignReadStatus.do().select();
    expect(
      itemsAfterSecondPost.length,
      "There should be a single view after second post"
    ).toBe(1);
  });

  it("Should set read_on and last_read_on on a new view", async () => {
    const response = await request(app)
      .post("/analytics/views/campaigns/1")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);

    const itemsAfterPost =
      await unguess.tables.WpUgCampaignReadStatus.do().select();
    expect(
      itemsAfterPost.length,
      "There should be a single view after post"
    ).toBe(1);
    const item = itemsAfterPost[0];

    expect(item.read_on).toBeNow(1);
    expect(item.last_read_on).toBeNow(1);
  });
});
