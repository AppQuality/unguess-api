import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";

const customer_1 = {
  id: 999,
  company: "Company 999",
  company_logo: "logo999.png",
  tokens: 100,
};

const customer_10 = {
  id: 10,
  company: "Company 10",
  company_logo: "logo999.png",
  tokens: 100,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 999,
};

const project_1 = {
  id: 999,
  display_name: "Project 999",
  customer_id: 999,
};

const project_2 = {
  id: 998,
  display_name: "Project 998",
  customer_id: 10,
};

const user_to_project_1 = {
  wp_user_id: 1,
  project_id: 999,
};

const campaign_type_1 = {
  id: 999,
  name: "Functional Testing (Bug Hunting)",
  type: FUNCTIONAL_CAMPAIGN_TYPE_ID,
};

const campaign_1 = {
  id: 1,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 2 title",
  customer_title: "Campaign 2 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: project_1.id,
  base_bug_internal_id: "BUG01",
};

const campaign_2 = {
  id: 2,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 2 title",
  customer_title: "Campaign 2 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: project_2.id,
};

describe("GET /campaigns/{cid}/bugs", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.add({
          companies: [customer_1, customer_10],
          userToCustomers: [user_to_customer_1],
          projects: [project_1, project_2],
          userToProjects: [user_to_project_1],
          campaignTypes: [campaign_type_1],
          campaigns: [campaign_1, campaign_2],
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  // It should answer 403 if user is not logged in
  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).get(`/campaigns/${campaign_1.id}/bugs`);

    expect(response.status).toBe(403);
  });

  // It should fail if the campaign does not exist
  it("Should fail if the campaign does not exist", async () => {
    const response = await request(app)
      .get(`/campaigns/999/bugs`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(400);
  });

  // It should fail if the user has no permission to see the campaign's project
  it("Should fail if the user has no permission to see the campaign's project", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_2.id}/bugs`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(403);
  });

  // Should return an error if the limit is not a number
  it("Should return an error if the limit is not a number", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?limit=abc&start=0`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(400);
  });

  // Should return an error if the start is not a number
  it("Should return an error if the start is not a number", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?limit=10&start=abc`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(400);
  });
});
