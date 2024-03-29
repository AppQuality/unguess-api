import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";
import { tryber } from "@src/features/database";

const customer_1 = {
  id: 999,
  company: "Company 999",
  company_logo: "logo999.png",
  tokens: 100,
};

const customer_10 = {
  id: 10,
  company: "Company 10",
  company_logo: "logo10.png",
  tokens: 100,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: customer_1.id,
};

const project_1 = {
  id: 999,
  display_name: "Project 999",
  customer_id: customer_1.id,
};

const project_2 = {
  id: 998,
  display_name: "Project 998",
  customer_id: 10,
};

const project_4 = {
  id: 997,
  display_name: "Project 4",
  customer_id: 10,
};

const user_to_project_1 = {
  wp_user_id: 1,
  project_id: project_1.id,
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
  platform_id: 1,
  page_preview_id: -1,
  page_manual_id: -1,
  customer_id: -1,
  pm_id: -1,
  description: "Campaign description",
};

const campaign_2 = {
  ...campaign_1,
  id: 2,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 998 title",
  customer_title: "Campaign 998 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: project_2.id,
};

const campaign_3 = {
  ...campaign_1,
  id: 3,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 997 title",
  customer_title: "Campaign 997 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: project_2.id,
};

const campaign_4 = {
  ...campaign_1,
  id: 4,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 997 title",
  customer_title: "Campaign 997 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: project_4.id,
};

const user_to_campaign_1 = {
  wp_user_id: 1,
  campaign_id: campaign_3.id,
};

describe("GET /campaigns/{cid}", () => {
  beforeAll(async () => {
    // await dbAdapter.create();

    await dbAdapter.add({
      companies: [customer_1, customer_10],
      userToCustomers: [user_to_customer_1],
      userToCampaigns: [user_to_campaign_1],
      projects: [project_1, project_2, project_4],
      userToProjects: [user_to_project_1],
      campaignTypes: [campaign_type_1],
      // campaigns: [campaign_1, campaign_2, campaign_3],
    });

    /**
     * Test fluid database inserts (using raw sqlite and knex)
     */
    await tryber.tables.WpAppqEvdCampaign.do().insert(campaign_1);
    await tryber.tables.WpAppqEvdCampaign.do().insert(campaign_2);
    await tryber.tables.WpAppqEvdCampaign.do().insert(campaign_3);
    await tryber.tables.WpAppqEvdCampaign.do().insert(campaign_4);
  });

  // It should answer 403 if user is not logged in
  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).get(`/campaigns/${campaign_1.id}`);
    expect(response.status).toBe(403);
  });

  // It should answer 400 if campaign does not exist
  it("Should answer 400 if campaign does not exist", async () => {
    const response = await request(app)
      .get(`/campaigns/999999`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  // It should answer 403 if the campaign exists but the user has no permissions to see the campaign
  it("Should answer 403 if the campaign exists but the user has no permissions to see the campaign", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_2.id}`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(403);
  });

  // It should answer 200 with the campaign if the user is an admin
  it("Should answer 200 with the campaign if the user is an admin", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}`)
      .set("Authorization", "Bearer admin");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: campaign_1.id,
        project: expect.objectContaining({
          id: project_1.id,
        }),
        status: expect.objectContaining({
          id: campaign_1.status_id,
        }),
        type: expect.objectContaining({
          id: campaign_1.campaign_type_id,
        }),
      })
    );
  });

  // Should answer 200 with the campaign if the user has specific permission to see the campaign
  it("Should answer 200 with the campaign if the user has specific permission to see the campaign", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_3.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: campaign_3.id,
      })
    );
  });

  // Should answer 200 with the campaign if the user has no specific permission for the campaign but has the permission for the project
  it("Should answer 200 with the campaign if the user has no specific permission for the campaign but has the permission for the project", async () => {
    await tryber.tables.WpAppqUserToProject.do().insert({
      wp_user_id: 1,
      project_id: project_4.id,
    });

    const response = await request(app)
      .get(`/campaigns/${campaign_4.id}`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: campaign_4.id,
      })
    );
  });

  // It should have all the required fields
  it("Should have all the required fields", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: campaign_1.id,
        start_date: campaign_1.start_date,
        end_date: campaign_1.end_date,
        close_date: campaign_1.close_date,
        title: campaign_1.title,
        customer_title: campaign_1.customer_title,
        is_public: campaign_1.is_public,
        type: expect.objectContaining({
          id: campaign_1.campaign_type_id,
          name: campaign_type_1.name,
        }),
        family: expect.objectContaining({
          id: campaign_type_1.type,
          name: "Functional",
        }),
        project: expect.objectContaining({
          id: project_1.id,
        }),
        status: expect.objectContaining({
          id: campaign_1.status_id,
        }),
      })
    );
  });
});
