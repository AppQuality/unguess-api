import app from "@src/app";
import request from "supertest";
import { unguess } from "@src/features/database";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import custom_statuses from "@src/__mocks__/database/custom_status";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";

const campaign_type_1 = {
  id: 1,
  name: "Functional Testing (Bug Hunting)",
  type: FUNCTIONAL_CAMPAIGN_TYPE_ID,
};

const customer_1 = {
  id: 1,
  company: "Company 1",
  company_logo: "logo1.png",
  tokens: 100,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: customer_1.id,
};

const project_1 = {
  id: 1,
  display_name: "Project 1",
  customer_id: customer_1.id,
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
  project_id: project_1.id,
};

const user_to_project_1 = {
  wp_user_id: 1,
  project_id: project_1.id,
};

const custom_status_1 = {
  id: 10,
  name: "Custom status 1",
  phase_id: 1,
  campaign_id: campaign_1.id,
  is_default: 0,
};

const customer_2 = {
  id: 2,
  company: "Company 2",
  company_logo: "logo2.png",
  tokens: 100,
};

const user_to_customer_2 = {
  wp_user_id: 2,
  customer_id: customer_2.id,
};

const project_2 = {
  id: 2,
  display_name: "Project 2",
  customer_id: customer_2.id,
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

const custom_status_2 = {
  id: 11,
  name: "Custom status 2",
  phase_id: 1,
  campaign_id: campaign_2.id,
  is_default: 0,
};

describe("DELETE /campaigns/{cid}/custom_statuses", () => {
  beforeAll(async () => {
    await dbAdapter.add({
      campaignTypes: [campaign_type_1],
      campaigns: [campaign_1, campaign_2],
      companies: [customer_1],
      projects: [project_1, project_2],
      userToCustomers: [user_to_customer_1, user_to_customer_2],
      userToProjects: [user_to_project_1],
    });

    await unguess.tables.WpUgBugCustomStatusPhase.do().insert({
      id: 1,
      name: "working",
    });
    await unguess.tables.WpUgBugCustomStatusPhase.do().insert({
      id: 2,
      name: "completed",
    });

    await custom_statuses.addDefaultItems();
    await custom_statuses.insert(custom_status_1);
    await custom_statuses.insert(custom_status_2);
  });

  afterAll(async () => {
    await dbAdapter.clear();
    await unguess.tables.WpUgBugCustomStatusPhase.do().delete();
    await custom_statuses.clear();
  });

  // It should answer 403 if user is not logged in
  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).delete(
      `/campaigns/${campaign_1.id}/custom_statuses`
    );

    expect(response.status).toBe(403);
  });

  // It should fail if the campaign does not exist
  it("Should fail if the campaign does not exist", async () => {
    const response = await request(app)
      .delete(`/campaigns/999/custom_statuses`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(400);
  });

  // It should return 200 if the user is the owner
  it("Should return 200 if the user is the owner", async () => {
    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        {
          custom_status_id: custom_status_1.id,
        },
      ]);
    expect(response.status).toBe(200);
  });

  // It should fail if the user is NOT the owner
  it("Should fail if the user is not the owner", async () => {
    const response = await request(app)
      .delete(`/campaigns/${campaign_2.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        {
          custom_status_id: custom_status_2.id,
        },
      ]);

    expect(response.status).toBe(403);
  });

  // It should fail if the custom status does not exist
  it("Should fail if the custom status does not exist", async () => {
    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        {
          custom_status_id: 999,
        },
      ]);

    expect(response.status).toBe(400);
  });

  // It should fail if the custom_status_id is not a number
  it("Should fail if the custom_status_id is not a number", async () => {
    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        {
          custom_status_id: "a",
        },
      ]);

    expect(response.status).toBe(400);
  });

  // It should fail if the custom status is default
  it("Should fail if the custom status is default", async () => {
    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        {
          custom_status_id: 1,
        },
      ]);

    expect(response.status).toBe(400);
  });

  // It should fail if the custom status is not from the campaign
  it("Should fail if the custom status is not from the campaign", async () => {
    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        {
          custom_status_id: custom_status_2.id,
        },
      ]);

    expect(response.status).toBe(400);
  });

  // It should return 200 and migrate the campaign bugs to the default custom status if the custom status is deleted

  // It should return 200 and migrate the campaign bugs to the target custom status if specified
});
