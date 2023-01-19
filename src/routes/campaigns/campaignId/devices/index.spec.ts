import app from "@src/app";
import request from "supertest";
import { adapter } from "@src/__mocks__/database/companyAdapter";
import bugs from "@src/__mocks__/database/bugs";
import devices from "@src/__mocks__/database/device";

describe("GET /campaigns/{cid}/devices", () => {
  beforeAll(async () => {
    await adapter.addCampaignWithProject({
      campaign_id: 1,
      project_id: 1,
      customer_id: 1,
      wp_user_id: 1,
    });
    await adapter.addCampaignWithProject({
      campaign_id: 2,
      project_id: 2,
      customer_id: 2,
      wp_user_id: 2,
    });
    await adapter.addCampaignWithProject({
      campaign_id: 3,
      project_id: 1,
      customer_id: 1,
      wp_user_id: 1,
    });

    await bugs.insert({
      id: 1,
      campaign_id: 1,
      manufacturer: "Apple",
      model: "iPhone 11",
      dev_id: 1,
    });
    await bugs.insert({
      id: 2,
      campaign_id: 1,
      manufacturer: "-",
      model: "Desktop",
      dev_id: 2,
    });
    await devices.insert({
      id: 1,
      form_factor: "Smartphone",
    });
    await devices.insert({
      id: 2,
      form_factor: "PC",
      pc_type: "Desktop",
    });
  });

  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).get("/campaigns/2/devices");
    expect(response.status).toBe(403);
  });

  it("Should answer 400 if campaign does not exists", async () => {
    const response = await request(app)
      .get("/campaigns/100/devices")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should answer 200 if campaign exists and user has access", async () => {
    const response = await request(app)
      .get("/campaigns/1/devices")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should answer with an empty list if there are no bugs ", async () => {
    const response = await request(app)
      .get("/campaigns/3/devices")
      .set("Authorization", "Bearer user");
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toEqual([]);
  });

  it("Should the devices of the bugs if there are bugs", async () => {
    const response = await request(app)
      .get("/campaigns/1/devices")
      .set("Authorization", "Bearer user");
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ device: "Apple iPhone 11" }),
        expect.objectContaining({ device: "Desktop" }),
      ])
    );
  });
});
