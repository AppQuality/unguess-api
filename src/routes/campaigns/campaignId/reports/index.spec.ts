import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { table as platformTable } from "@src/__mocks__/database/platforms";

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
  type: 0,
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
};

const report_1 = {
  id: 1,
  title: "Report 1 title",
  description: "Report 1 description",
  campaign_id: campaign_1.id,
  uploader_id: 1,
  url: "https://www.google.com",
};

describe("GET /campaigns/{cid}/reports", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.create();
        await platformTable.create();

        await dbAdapter.add({
          companies: [customer_1],
          userToCustomers: [user_to_customer_1],
          projects: [project_1, project_2],
          userToProjects: [user_to_project_1],
          campaignTypes: [campaign_type_1],
          campaigns: [campaign_1],
          reports: [report_1],
        });
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
        await dbAdapter.drop();
        await platformTable.drop();
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  // It should answer 403 if user is not logged in
  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).get(
      `/campaigns/${campaign_1.id}/reports`
    );
    expect(response.status).toBe(403);
  });

  // It should answer 200 with an array of reports
  it("Should answer 200 with an array of reports", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/reports`)
      .set("Authorization", `Bearer customer`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ...report_1,
        }),
      ])
    );
  });

  // It should fail if the campaign does not exist

  // It should fail if the user has no permission to see the campaign's project
});
