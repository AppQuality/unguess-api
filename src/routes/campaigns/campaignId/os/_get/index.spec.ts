import app from "@src/app";
import request from "supertest";
import { adapter } from "@src/__mocks__/database/companyAdapter";
import bugs from "@src/__mocks__/database/bugs";
import bugStatus from "@src/__mocks__/database/bug_status";

describe("GET /campaigns/{cid}/os", () => {
  beforeAll(async () => {
    await bugStatus.addDefaultItems();
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
      os: "iOS",
      os_version: "15",
      dev_id: 1,
    });
    await bugs.insert({
      id: 2,
      campaign_id: 1,
      manufacturer: "-",
      model: "Desktop",
      os: "Windows",
      os_version: "11",
      dev_id: 2,
    });
    await bugs.insert({
      id: 3,
      campaign_id: 1,
      manufacturer: "-",
      model: "Desktop",
      os: "Windows",
      os_version: "10",
      dev_id: 3,
      status_id: 4,
    });
    await bugs.insert({
      id: 4,
      campaign_id: 1,
      manufacturer: "-",
      model: "Desktop",
      os: "Windows",
      os_version: "10",
      dev_id: 3,
      status_id: 1,
    });
    await bugs.insert({
      id: 5,
      campaign_id: 1,
      manufacturer: "-",
      model: "Desktop",
      os: "Windows",
      os_version: "XP",
      dev_id: 3,
      status_id: 1,
      publish: 0,
    });
    await bugs.insert({
      id: 6,
      campaign_id: 1,
      manufacturer: "-",
      model: "Desktop",
      os: "Windows",
      os_version: "11",
      dev_id: 9,
    });
  });

  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).get("/campaigns/2/os");
    expect(response.status).toBe(403);
  });

  it("Should answer 400 if campaign does not exists", async () => {
    const response = await request(app)
      .get("/campaigns/100/os")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should answer 200 if campaign exists and user has access", async () => {
    const response = await request(app)
      .get("/campaigns/1/os")
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should answer with an empty list if there are no bugs ", async () => {
    const response = await request(app)
      .get("/campaigns/3/os")
      .set("Authorization", "Bearer user");
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body).toEqual([]);
  });

  it("Should the os of the bugs if there are bugs", async () => {
    const response = await request(app)
      .get("/campaigns/1/os")
      .set("Authorization", "Bearer user");
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ os: "iOS 15" }),
        expect.objectContaining({ os: "Windows 11" }),
      ])
    );
  });
});
