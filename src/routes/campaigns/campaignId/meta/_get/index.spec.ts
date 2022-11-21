import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";
import useCases, { UseCaseParams } from "@src/__mocks__/database/use_cases";
import candidates from "@src/__mocks__/database/cp_has_candidate";

const customer_1 = {
  id: 999,
  company: "Company 999",
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
  form_factor: " ",
};

const campaign_2 = {
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
  form_factor: "1,2",
};

const useCase1: UseCaseParams = {
  id: 123,
  title: "Use Case 1: Titolone (Web)",
  content: "Use Case 1 description",
  campaign_id: campaign_1.id,
  simple_title: "Titolone",
  prefix: "Use Case 1:",
  info: "Web",
};

describe("GET /campaigns/{cid}/meta", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.add({
          companies: [customer_1],
          userToCustomers: [user_to_customer_1],
          projects: [project_1, project_2],
          userToProjects: [user_to_project_1],
          campaignTypes: [campaign_type_1],
          campaigns: [campaign_1, campaign_2],
        });

        await candidates.mock();
        await candidates.insert({
          user_id: 32,
          campaign_id: campaign_1.id,
          accepted: 1,
        });
        await candidates.insert({
          user_id: 33,
          campaign_id: campaign_1.id,
          accepted: 1,
        });
        await candidates.insert({
          user_id: 34,
          campaign_id: campaign_1.id,
          accepted: 1,
        });
        await candidates.insert({
          user_id: 35,
          campaign_id: campaign_1.id,
          accepted: 0,
        });

        await useCases.insert(useCase1);
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  afterAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.clear();
        await candidates.dropMock();
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  // It should answer 403 if user is not logged in
  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).get(`/campaigns/${campaign_1.id}/meta`);
    expect(response.status).toBe(403);
  });

  // It should answer 400 if campaign does not exist
  it("Should answer 400 if campaign does not exist", async () => {
    const response = await request(app)
      .get(`/campaigns/999999/meta`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  // It should answer 403 if the user has no permissions to see the campaign
  it("Should answer 403 if the user has no permissions to see the campaign", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_2.id}/meta`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  it("Should answer 200 and return the number of selected testers", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/meta`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);

    expect(response.body.selected_testers).toEqual(3);
  });

  it("Should return an empty array if there are no device configurations", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/meta`)
      .set("Authorization", "Bearer user");

    expect(response.body.allowed_devices.length).toEqual(0);
  });

  it("Should return 0 if there are no selected testers", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_2.id}/meta`)
      .set("Authorization", "Bearer admin");

    expect(response.body.selected_testers).toEqual(0);
  });

  it("Should return an array with form factor", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_2.id}/meta`)
      .set("Authorization", "Bearer admin");

    expect(response.body.allowed_devices.length).toEqual(2);
    expect(response.body.allowed_devices).toEqual(
      expect.arrayContaining(["tablet", "desktop"])
    );
  });

  // --- end of tests ---
});
