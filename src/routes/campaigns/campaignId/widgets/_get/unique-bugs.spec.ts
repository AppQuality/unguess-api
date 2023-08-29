import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import bugs from "@src/__mocks__/database/bugs";
import uniqueBugsRead from "@src/__mocks__/database/customer_unique_bug_read";
import isGracePeriodPassed from "./uniqueBugsWidget/isGracePeriodPassed";

jest.mock("./uniqueBugsWidget/isGracePeriodPassed", () =>
  jest.fn().mockImplementation(() => true)
);

const customer_10 = {
  id: 10,
  company: "Company 10",
  company_logo: "logo999.png",
  tokens: 100,
};

describe("GET /campaigns/{cid}/widgets - unique bugs", () => {
  beforeAll(async () => {
    await dbAdapter.add({
      campaigns: [
        { id: 1, project_id: 1 },
        { id: 2, project_id: 2 },
        { id: 3, project_id: 1, cust_bug_vis: 1 },
        { id: 4, project_id: 1 },
      ],
      companies: [{ id: 100, company: "company 1" }, customer_10],
      campaignTypes: [{ id: 1, name: "Test" }],
      userToCustomers: [{ wp_user_id: 1, customer_id: 100 }],
      projects: [
        { id: 1, customer_id: 100 },
        { id: 2, customer_id: 10 },
      ],
      userToProjects: [
        {
          wp_user_id: 1,
          project_id: 1,
        },
      ],
      profiles: [{ wp_user_id: 1, id: 32 }],
    });
    await bugs.insert({ id: 1, campaign_id: 1, wp_user_id: 5, status_id: 2 });
    await bugs.insert({
      id: 2,
      campaign_id: 1,
      wp_user_id: 5,
      is_duplicated: 1,
      status_id: 2,
    });
    await bugs.insert({
      id: 3,
      campaign_id: 1,
      wp_user_id: 5,
      is_duplicated: 1,
      status_id: 2,
    });
    await bugs.insert({
      id: 4,
      campaign_id: 1,
      wp_user_id: 5,
      status_id: 1,
    });
    await bugs.insert({
      id: 5,
      campaign_id: 1,
      wp_user_id: 5,
      status_id: 3,
    });
    await bugs.insert({
      id: 6,
      campaign_id: 1,
      wp_user_id: 5,
      status_id: 4,
    });

    await bugs.insert({
      id: 7,
      campaign_id: 3,
      wp_user_id: 5,
      status_id: 4,
    });
    await bugs.insert({
      id: 8,
      campaign_id: 3,
      wp_user_id: 5,
      status_id: 2,
    });
    await bugs.insert({
      id: 9,
      campaign_id: 3,
      wp_user_id: 5,
      status_id: 1,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    uniqueBugsRead.clear();
  });
  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).get(
      `/campaigns/1/widgets?s=unique-bugs`
    );
    expect(response.status).toBe(403);
  });

  it("Should answer 403 if user doesnt have access to campaign", async () => {
    const response = await request(app)
      .get(`/campaigns/2/widgets?s=unique-bugs`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  it("Should answer 200 if user has access to campaign", async () => {
    const response = await request(app)
      .get(`/campaigns/1/widgets?s=unique-bugs`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should answer 422 if user query parameter updateTrend is set on other widgets", async () => {
    for (const widget of ["bugs-by-usecase", "bugs-by-device", "cp-progress"]) {
      const response = await request(app)
        .get(`/campaigns/1/widgets?s=${widget}&updateTrend=true`)
        .set("Authorization", "Bearer user");
      expect(response.status).toBe(422);
    }
  });

  it("Should return the number of accepted bugs on success", async () => {
    const response = await request(app)
      .get(`/campaigns/1/widgets?s=unique-bugs`)
      .set("Authorization", "Bearer user");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("total", 3);
  });

  it("Should return the number of accepted unique bugs on success", async () => {
    const response = await request(app)
      .get(`/campaigns/1/widgets?s=unique-bugs`)
      .set("Authorization", "Bearer user");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("unique", 1);
  });

  it("Should return show unique and total bugs in review if the campaign has the review visibility active", async () => {
    const response = await request(app)
      .get(`/campaigns/3/widgets?s=unique-bugs`)
      .set("Authorization", "Bearer user");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("total", 2);
    expect(response.body.data).toHaveProperty("unique", 2);
  });

  it("Should return the trend from the last trend update", async () => {
    const response = await request(app)
      .get(`/campaigns/1/widgets?s=unique-bugs`)
      .set("Authorization", "Bearer user");
    expect(response.body).toHaveProperty("data");
    expect(response.body.data).toHaveProperty("trend", 1);
  });

  it("Should return update trend if requested", async () => {
    jest.mock("./uniqueBugsWidget/isGracePeriodPassed", () => {
      return {
        __esModule: true,
        default: jest.fn(() => true),
      };
    });
    const nonUpdatingResponse = await request(app)
      .get(`/campaigns/1/widgets?s=unique-bugs`)
      .set("Authorization", "Bearer user");
    expect(nonUpdatingResponse.body).toHaveProperty("data");
    expect(nonUpdatingResponse.body.data).toHaveProperty("trend", 1);
    const responseBeforeUpdate = await request(app)
      .get(`/campaigns/1/widgets?s=unique-bugs&updateTrend=true`)
      .set("Authorization", "Bearer user");
    expect(responseBeforeUpdate.body).toHaveProperty("data");
    expect(responseBeforeUpdate.body.data).toHaveProperty("trend", 1);
    const responseAfterUpdate = await request(app)
      .get(`/campaigns/1/widgets?s=unique-bugs&updateTrend=true`)
      .set("Authorization", "Bearer user");
    expect(responseAfterUpdate.body).toHaveProperty("data");
    expect(responseAfterUpdate.body.data).toHaveProperty("trend", 0);
  });

  it("Should return 0 as bugs and unique if campaign is without bugs", async () => {
    const nonUpdatingResponse = await request(app)
      .get(`/campaigns/4/widgets?s=unique-bugs`)
      .set("Authorization", "Bearer user");
    expect(nonUpdatingResponse.body).toHaveProperty("data");
    expect(nonUpdatingResponse.body.data).toHaveProperty("total", 0);
    expect(nonUpdatingResponse.body.data).toHaveProperty("unique", 0);
    expect(nonUpdatingResponse.body.data).toHaveProperty("trend", 0);
  });

  it("Should not update trend if grace period is not past", async () => {
    const mockedisGracePeriodPassed = jest.mocked(isGracePeriodPassed, true);
    mockedisGracePeriodPassed.mockRestore();
    const responseBeforeUpdate = await request(app)
      .get(`/campaigns/1/widgets?s=unique-bugs&updateTrend=true`)
      .set("Authorization", "Bearer user");
    expect(responseBeforeUpdate.body).toHaveProperty("data");
    expect(responseBeforeUpdate.body.data).toHaveProperty("trend", 1);
    const responseAfterUpdate = await request(app)
      .get(`/campaigns/1/widgets?s=unique-bugs&updateTrend=true`)
      .set("Authorization", "Bearer user");
    expect(responseAfterUpdate.body).toHaveProperty("data");
    expect(responseAfterUpdate.body.data).toHaveProperty("trend", 1);
  });
});
