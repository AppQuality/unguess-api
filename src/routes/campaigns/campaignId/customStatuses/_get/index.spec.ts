import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";
import custom_statuses from "@src/__mocks__/database/custom_status";

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

const customer_2 = {
  id: 2,
  company: "Company 2",
  company_logo: "logo999.png",
  tokens: 100,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 1,
};

const user_to_customer_2 = {
  wp_user_id: 2,
  customer_id: 2,
};

const project_1 = {
  id: 1,
  display_name: "Project 999",
  customer_id: 1,
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

describe("GET /campaigns/{cid}/custom_statuses", () => {
  beforeAll(async () => {
    await dbAdapter.add({
      campaignTypes: [campaign_type_1],
      campaigns: [campaign_1, campaign_2],
      companies: [customer_1, customer_2],
      projects: [project_1, project_2],
      userToCustomers: [user_to_customer_1, user_to_customer_2],
    });

    await custom_statuses.addDefaultItems();
  });

  // It should answer 403 if user is not logged in
  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).get(
      `/campaigns/${campaign_1.id}/custom_statuses`
    );

    expect(response.status).toBe(403);
  });

  // It should fail if the campaign does not exist
  it("Should fail if the campaign does not exist", async () => {
    const response = await request(app)
      .get(`/campaigns/999/custom_statuses`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(400);
  });

  // It should return 200 if the user is the owner
  it("Should return 200 if the user is the owner", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  // It should fail if the user is NOT the owner
  it("Should fail if the user is not the owner", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_2.id}/custom_statuses`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  // It should return the list of custom_statuses
  it("Should return the list of custom_statuses ordered by id DESC", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);

    console.log(response.body);

    const { body } = response;

    expect(body).toEqual(
      custom_statuses.getDefaultItems().sort((t1, t2) => t2.id - t1.id)
    );
  });

  // It should not return the list of statuses for a campaign where the user is not an owner
  it("Should not return the list of custom_statuses for a campaign where the user is not an owner", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_2.id}/custom_statuses`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(403);
  });
});
