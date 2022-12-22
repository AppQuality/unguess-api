import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";
import severities from "@src/__mocks__/database/bug_severity";
import customSeverities from "@src/__mocks__/database/bug_severity_custom";

const campaign_type_1 = {
  id: 1,
  name: "Functional Testing (Bug Hunting)",
  type: FUNCTIONAL_CAMPAIGN_TYPE_ID,
};
const customer_1 = {
  id: 1,
  company: "Company 1",
  company_logo: "logo999.png",
  tokens: 100,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 1,
};

const project_1 = {
  id: 1,
  display_name: "Project 999",
  customer_id: 1,
};
const customer_2 = {
  id: 2,
  company: "Company 2",
  company_logo: "logo999.png",
  tokens: 100,
};

const user_to_customer_2 = {
  wp_user_id: 2,
  customer_id: 2,
};

const project_2 = {
  id: 2,
  display_name: "Project 2",
  customer_id: 2,
};

const campaign_1 = {
  id: 1,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 1 title",
  customer_title: "Campaign 1 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: 1,
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
  project_id: 2,
};

const campaign_3 = {
  id: 3,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 3 default severities",
  customer_title: "Campaign 3 default severities",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: 1,
};

describe("GET /campaigns/{cid}/severities", () => {
  beforeAll(async () => {
    await dbAdapter.add({
      campaignTypes: [campaign_type_1],
      campaigns: [campaign_1, campaign_2, campaign_3],
      companies: [customer_1, customer_2],
      projects: [project_1, project_2],
      userToCustomers: [user_to_customer_1, user_to_customer_2],
    });
    await severities.addDefaultItems();
    await customSeverities.insert({
      id: 1,
      campaign_id: 1,
      bug_severity_id: 1,
    });
    await customSeverities.insert({
      id: 2,
      campaign_id: 1,
      bug_severity_id: 4,
    });
  });

  // It should answer 403 if user is not logged in
  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).get(
      `/campaigns/${campaign_1.id}/severities`
    );

    expect(response.status).toBe(403);
  });

  // It should fail if the campaign does not exist
  it("Should fail if the campaign does not exist", async () => {
    const response = await request(app)
      .get(`/campaigns/999/severities`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(400);
  });

  // it should return 200 if the user is the owner
  it("Should return 200 if the user is the owner", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/severities`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  // it Should fail if the user is not the owner
  it("Should fail if the user is not the owner", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_2.id}/severities`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  //should return campaign bugTypes
  it("Should return campaign custom severities", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/severities`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 1,
        name: "LOW",
      },
      {
        id: 4,
        name: "CRITICAL",
      },
    ]);
  });

  it("Should return all campaign severities if campaign has not custom severity", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_3.id}/severities`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 1,
        name: "LOW",
      },
      {
        id: 2,
        name: "MEDIUM",
      },
      {
        id: 3,
        name: "HIGH",
      },
      {
        id: 4,
        name: "CRITICAL",
      },
    ]);
  });

  // --- End of file
});
