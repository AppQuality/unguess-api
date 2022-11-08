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
import CampaignMeta from "@src/__mocks__/database/campaign_meta";
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

const campaign_4 = {
  id: 4,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 4 title",
  customer_title: "Campaign 4 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: project_1.id,
  cust_bug_vis: 1,
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

const bug_1: BugsParams = {
  id: 1,
  internal_id: "BUG1",
  message: "[CON-TEXT] - Bug 1 super-message",
  description: "Bug 1 description",
  expected_result: "Bug 1 expected result",
  current_result: "Bug 1 current result",
  campaign_id: campaign_1.id,
  bug_type_id: 1,
  bug_replicability_id: 1,
  status_id: 2,
  status_reason: "Bug 1 status reason",
  application_section: "Bug 1 application section",
  note: "Bug 1 note",
  wp_user_id: 1,
  dev_id: device_1.id,
  manufacturer: device_1.manufacturer,
  model: device_1.model,
  os: device_1.operating_system,
  os_version: device_1.os_version,
  severity_id: 1,
};

const bug_2: BugsParams = {
  id: 2,
  internal_id: "BUG2",
  message: "Bug 2 message",
  description: "Bug 2 description",
  expected_result: "Bug 2 expected result",
  current_result: "Bug 2 current result",
  campaign_id: campaign_1.id,
  bug_type_id: 1,
  bug_replicability_id: 1,
  status_id: 2,
  status_reason: "Bug 2 status reason",
  application_section: "Bug 2 application section",
  note: "Bug 2 note",
  wp_user_id: 1,
  is_favorite: 1,
  dev_id: device_1.id,
  manufacturer: device_1.manufacturer,
  model: device_1.model,
  os: device_1.operating_system,
  os_version: device_1.os_version,
  severity_id: 2,
};

const bug_3: BugsParams = {
  id: 3,
  internal_id: "BUG3",
  message: "Bug 3 message",
  description: "Bug 3 description",
  expected_result: "Bug 3 expected result",
  current_result: "Bug 3 current result",
  campaign_id: campaign_1.id,
  bug_type_id: 1,
  bug_replicability_id: 1,
  status_id: 1,
  status_reason: "Bug 3 status reason",
  application_section: "Bug 3 application section",
  note: "Bug 3 note",
  wp_user_id: 1,
  is_favorite: 1,
  dev_id: device_1.id,
  manufacturer: device_1.manufacturer,
  model: device_1.model,
  os: device_1.operating_system,
  os_version: device_1.os_version,
  severity_id: 2,
};

const bug_4: BugsParams = {
  id: 4,
  internal_id: "BUG4",
  message: "Bug 4 message",
  description: "Bug 4 description",
  expected_result: "Bug 4 expected result",
  current_result: "Bug 4 current result",
  campaign_id: campaign_1.id,
  bug_type_id: 1,
  bug_replicability_id: 1,
  status_id: 4,
  status_reason: "Bug 4 status reason",
  application_section: "Bug 4 application section",
  note: "Bug 4 note",
  wp_user_id: 1,
  is_favorite: 1,
  dev_id: device_1.id,
  manufacturer: device_1.manufacturer,
  model: device_1.model,
  os: device_1.operating_system,
  os_version: device_1.os_version,
  severity_id: 2,
};

const bug_5: BugsParams = {
  id: 5,
  internal_id: "BUG5",
  message: "Bug 5 message",
  description: "Bug 5 description",
  expected_result: "Bug 5 expected result",
  current_result: "Bug 5 current result",
  campaign_id: campaign_4.id,
  bug_type_id: 1,
  bug_replicability_id: 1,
  status_id: 4,
  status_reason: "Bug 5 status reason",
  application_section: "Bug 5 application section",
  note: "Bug 5 note",
  wp_user_id: 1,
  is_favorite: 1,
  dev_id: device_1.id,
  manufacturer: device_1.manufacturer,
  model: device_1.model,
  os: device_1.operating_system,
  os_version: device_1.os_version,
  severity_id: 2,
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
          campaigns: [campaign_1, campaign_2, campaign_3, campaign_4],
        });
        await CampaignMeta.mock();
        await CampaignMeta.insert({
          meta_id: 1,
          campaign_id: campaign_1.id,
          meta_key: "bug_title_rule",
          meta_value: "1",
        });
        await bugs.mock();
        await bugMedia.mock();
        await bugSeverity.mock();
        await bugReplicability.mock();
        await bugType.mock();
        await bugStatus.mock();
        await devices.mock();

        await bugs.insert(bug_1);
        await bugs.insert(bug_2);
        await bugs.insert(bug_3);
        await bugs.insert(bug_4);
        await bugs.insert(bug_5);
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
        await CampaignMeta.dropMock();
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
      .get(`/campaigns/${campaign_1.id}/bugs`)
      .set("Authorization", "Bearer customer");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("items");
    expect(response.body).toHaveProperty("start");
    expect(response.body).toHaveProperty("limit");
    expect(response.body).toHaveProperty("size");
    expect(response.body).toHaveProperty("total");

    expect(response.body.items).toHaveLength(2);

    expect(response.body).toMatchObject(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            id: bug_2.id,
          }),
          expect.objectContaining({
            id: bug_1.id,
          }),
        ],
      })
    );

    // If smartphone, the bug should have manufacturer and model
    response.body.items.forEach(
      (
        bug: StoplightOperations["get-campaigns-single-bug"]["responses"]["200"]["content"]["application/json"]
      ) => {
        expect(bug).toMatchObject(
          expect.objectContaining({
            device: expect.objectContaining({
              manufacturer: device_1.manufacturer,
              model: device_1.model,
              type: "smartphone",
            }),
          })
        );
      }
    );
  });

  // Should return an empty items array if the campaign has not bugs
  it("Should return Should return an empty items array if the campaign has not bugs", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_3.id}/bugs`)
      .set("Authorization", "Bearer customer");

    expect(response.body.items).toEqual([]);
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
      .get(`/campaigns/${campaign_1.id}/bugs?limit=10&start=abc`)
      .set("Authorization", "Bearer customer");

    expect(response.status).toBe(400);
  });

  // Should return the items paginated by limit and start parameters
  it("Should return the items paginated by limit and start parameters", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?limit=1&start=0`)
      .set("Authorization", "Bearer customer");

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            id: bug_2.id,
          }),
        ],
      })
    );
  });

  // Should order by the default order if the order is not valid or not provided
  it("Should order by the default order if the order is not valid or not provided", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?limit=10&start=0&order=abc`)
      .set("Authorization", "Bearer customer");

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            id: bug_2.id,
          }),
          expect.objectContaining({
            id: bug_1.id,
          }),
        ],
      })
    );
  });

  // Should return the results ordered by the order parameter
  it("Should return the results ordered by the order parameter", async () => {
    // If orderBy is not specified, the default order is by id
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?limit=10&start=0&order=ASC`)
      .set("Authorization", "Bearer customer");

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            id: bug_1.id,
          }),
          expect.objectContaining({
            id: bug_2.id,
          }),
        ],
      })
    );
  });

  // Should order by the default orderBy if the orderBy is not valid or not provided
  it("Should order by the default orderBy if the orderBy is not valid or not provided", async () => {
    const response = await request(app)
      .get(
        `/campaigns/${campaign_1.id}/bugs?limit=10&start=0&order=ASC&orderBy=abc`
      )
      .set("Authorization", "Bearer customer");

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            id: bug_1.id,
          }),
          expect.objectContaining({
            id: bug_2.id,
          }),
        ],
      })
    );
  });

  // Should return the results ordered by the orderBy parameter
  it("Should return the results ordered by the orderBy parameter", async () => {
    const response = await request(app)
      .get(
        `/campaigns/${campaign_1.id}/bugs?limit=10&start=0&order=DESC&orderBy=is_favorite`
      )
      .set("Authorization", "Bearer customer");

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            id: bug_2.id,
          }),
          expect.objectContaining({
            id: bug_1.id,
          }),
        ],
      })
    );
  });

  // Should return the normal results if the filterBy is not accepted
  it("Should return an error if the filterBy is not valid", async () => {
    const response = await request(app)
      .get(
        `/campaigns/${campaign_1.id}/bugs?limit=10&start=0&filterBy[abc]=abc`
      )
      .set("Authorization", "Bearer customer");

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            id: bug_2.id,
          }),
          expect.objectContaining({
            id: bug_1.id,
          }),
        ],
      })
    );
  });

  // Should return the results filtered by the filterBy parameter
  it("Should return the results filtered by the filterBy parameter", async () => {
    const response = await request(app)
      .get(
        `/campaigns/${campaign_1.id}/bugs?limit=10&start=0&filterBy[is_favorite]=1`
      )
      .set("Authorization", "Bearer customer");

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            id: bug_2.id,
          }),
        ],
      })
    );
  });

  // Should return the correct items in the correct order if all parameters are specified
  it("Should return the correct items in the correct order if all parameters are specified", async () => {
    const response = await request(app)
      .get(
        `/campaigns/${campaign_1.id}/bugs?limit=10&start=0&orderBy=severity_id&order=ASC&filterBy[is_favorite]=1`
      )
      .set("Authorization", "Bearer customer");

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            id: bug_2.id,
          }),
        ],
      })
    );
  });

  it("Should return the context parameters for each bugs if title_rule is active and the bug has context", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs`)
      .set("Authorization", "Bearer customer");

    expect(response.body.items[0].title).toEqual({
      full: bug_2.message,
      compact: bug_2.message,
    });

    expect(response.body.items[1].title).toEqual({
      full: bug_1.message,
      compact: "Bug 1 super-message",
      context: "CON-TEXT",
    });
  });

  it("Should not return refused bugs", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs`)
      .set("Authorization", "Bearer customer");

    expect(response.body.items.length).toBe(2);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: bug_1.id }),
        expect.objectContaining({ id: bug_2.id }),
      ])
    );
  });

  it("Should not return need review bugs if option is not enabled", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs`)
      .set("Authorization", "Bearer customer");

    expect(response.body.items.length).toBe(2);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: bug_1.id }),
        expect.objectContaining({ id: bug_2.id }),
      ])
    );
  });
  it("Should return need review bugs if option is not enabled but user is admin", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs`)
      .set("Authorization", "Bearer administrator");

    expect(response.body.items.length).toBe(3);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: bug_1.id }),
        expect.objectContaining({ id: bug_2.id }),
        expect.objectContaining({ id: bug_4.id }),
      ])
    );
  });

  it("Should return need review bugs if option is enabled", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_4.id}/bugs`)
      .set("Authorization", "Bearer customer");

    expect(response.body.items.length).toBe(1);
    expect(response.body.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: bug_5.id })])
    );
  });

  // --- End of file
});
