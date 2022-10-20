import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { table as platformTable } from "@src/__mocks__/database/platforms";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";
import bugs, { BugsParams } from "@src/__mocks__/database/bugs";
import bugMedia from "@src/__mocks__/database/bug_media";
import bugSeverity from "@src/__mocks__/database/bug_severity";
import bugReplicability from "@src/__mocks__/database/bug_replicability";
import bugType from "@src/__mocks__/database/bug_type";
import bugStatus from "@src/__mocks__/database/bug_status";
import devices, { DeviceParams } from "@src/__mocks__/database/device";

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

const campaign_3 = {
  id: 3,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 3 title",
  customer_title: "Campaign 3 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: project_1.id,
};

const bug_1: BugsParams = {
  id: 1,
  internal_id: "BUG1",
  message: "Bug 1 message",
  description: "Bug 1 description",
  expected_result: "Bug 1 expected result",
  current_result: "Bug 1 current result",
  campaign_id: campaign_1.id,
  bug_type_id: 1,
  bug_replicability_id: 1,
  status_id: 1,
  status_reason: "Bug 1 status reason",
  application_section: "Bug 1 application section",
  note: "Bug 1 note",
  manufacturer: "Bug 1 manufacturer",
  model: "Bug 1 model",
  os: "Bug 1 os",
  os_version: "Bug 1 os version",
  wp_user_id: 1,
};

const device_1: DeviceParams = {
  id: 12,
  manufacturer: "Apple",
  model: "iPhone 13",
  platform_id: 2,
  id_profile: 61042,
  os_version: "iOS 16 (16)",
  operating_system: "iOS",
  form_factor: "Smartphone",
};

const bug_media_1 = {
  id: 123,
  bug_id: bug_1.id,
  location: "https://example.com/bug_media_1.png",
  type: "image",
  uploaded: "2021-10-19 12:57:57.0",
};

describe("GET /campaigns/{cid}/bugs", () => {
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
          campaigns: [campaign_1, campaign_2, campaign_3],
        });

        await bugs.mock();
        await bugMedia.mock();
        await bugSeverity.mock();
        await bugReplicability.mock();
        await bugType.mock();
        await bugStatus.mock();
        await devices.mock();

        await bugs.insert(bug_1);
        await bugMedia.insert(bug_media_1);
        await bugSeverity.addDefaultItems();
        await bugReplicability.addDefaultItems();
        await bugType.addDefaultItems();
        await bugStatus.addDefaultItems();
        await devices.insert(device_1);
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
        await bugs.dropMock();
        await bugMedia.dropMock();
        await bugSeverity.dropMock();
        await bugReplicability.dropMock();
        await bugType.dropMock();
        await bugStatus.dropMock();
        await devices.dropMock();
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
      .set("Authorization", "Bearer customer");

    expect(response.status).toBe(400);
  });

  // It should fail if the user has no permission to see the campaign's project
  it("Should fail if the user has no permission to see the campaign's project", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_2.id}/bugs`)
      .set("Authorization", "Bearer customer");

    expect(response.status).toBe(403);
  });

  // It should answer 200 with paginated bugs
  it("Should answer 200 with paginated bugs", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?limit=1&start=0`)
      .set("Authorization", "Bearer customer");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("items");
    expect(response.body).toHaveProperty("start");
    expect(response.body).toHaveProperty("limit");
    expect(response.body).toHaveProperty("size");
    expect(response.body).toHaveProperty("total");

    expect(response.body.items).toHaveLength(1);

    expect(response.body).toMatchObject(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            id: bug_1.id,
          }),
        ],
      })
    );
  });

  // Should return an error if the limit is not a number
  it("Should return an error if the limit is not a number", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?limit=abc&start=0`)
      .set("Authorization", "Bearer customer");

    expect(response.status).toBe(400);
  });

  // Should return an error if the start is not a number
  it("Should return an error if the start is not a number", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?limit=1&start=abc`)
      .set("Authorization", "Bearer customer");

    expect(response.status).toBe(400);
  });

  // Should return an error if the order is a not valid string

  // Should return an error if the order is not valid

  // Should return the results ordered by the order parameter

  // Should return an error if the orderBy is not valid

  // Should return the results ordered by the orderBy parameter

  // Should return an error if the filterBy is not valid

  // Should return the results filtered by the filterBy parameter

  // Should return the correct severity_name based on the severity_id

  // Should return the correct bug_type_name based on the bug_type_id

  // Should return the correct bug_replicability_name based on the bug_replicability_id

  // Should return the correct device type
});
