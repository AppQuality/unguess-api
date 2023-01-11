import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";
import bugType from "@src/__mocks__/database/bug_type";
import bugs from "@src/__mocks__/database/bugs";
import customBugTypes from "@src/__mocks__/database/bug_type_custom";

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
  title: "Campaign 3 default bugTypes",
  customer_title: "Campaign 3 default bugTypes",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: 1,
};

const campaign_4 = {
  id: 4,
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

describe("GET /campaigns/{cid}/bugTypes", () => {
  beforeAll(async () => {
    await dbAdapter.add({
      campaignTypes: [campaign_type_1],
      campaigns: [campaign_1, campaign_2, campaign_3, campaign_4],
      companies: [customer_1, customer_2],
      projects: [project_1, project_2],
      userToCustomers: [user_to_customer_1, user_to_customer_2],
    });
    await bugType.addDefaultItems();

    await customBugTypes.insert({
      id: 1,
      campaign_id: 1,
      bug_type_id: 1,
    });

    await customBugTypes.insert({
      id: 2,
      campaign_id: 1,
      bug_type_id: 5,
    });
    await customBugTypes.insert({
      id: 3,
      campaign_id: 4,
      bug_type_id: 1,
    });

    await bugs.insert({
      id: 1,
      campaign_id: 4,
      bug_type_id: 5,
    });
    await bugs.insert({
      id: 2,
      campaign_id: 4,
      bug_type_id: 3,
      publish: 0,
    });
    await bugs.insert({
      id: 3,
      campaign_id: 4,
      bug_type_id: 3,
      status_id: 1,
    });
  });

  // It should answer 403 if user is not logged in
  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).get(
      `/campaigns/${campaign_1.id}/bugTypes`
    );

    expect(response.status).toBe(403);
  });

  // It should fail if the campaign does not exist
  it("Should fail if the campaign does not exist", async () => {
    const response = await request(app)
      .get(`/campaigns/999/bugTypes`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(400);
  });

  // it should return 200 if the user is the owner
  it("Should return 200 if the user is the owner", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugTypes`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  // it Should fail if the user is not the owner
  it("Should fail if the user is not the owner", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_2.id}/bugTypes`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  //should return campaign bugTypes
  it("Should return custom campaign bugTypes if campaign has custom bugTypes", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugTypes`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 1,
        name: "Crash",
      },
      {
        id: 5,
        name: "Performance",
      },
    ]);
  });

  it("Should return all campaign bugTypes if campaign has not custom bugTypes", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_3.id}/bugTypes`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 1,
        name: "Crash",
      },
      {
        id: 3,
        name: "Graphic",
      },
      {
        id: 5,
        name: "Performance",
      },
      {
        id: 6,
        name: "Malfunction",
      },
      {
        id: 7,
        name: "Typo",
      },
      {
        id: 8,
        name: "Other",
      },
      {
        id: 9,
        name: "Security",
      },
      {
        id: 10,
        name: "Usability",
      },
    ]);
  });

  it("Should return bug bugTypes even if campaign does not accept them", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_4.id}/bugTypes`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 1,
        name: "Crash",
      },
      {
        id: 5,
        name: "Performance",
      },
    ]);
  });

  // --- End of file
});
