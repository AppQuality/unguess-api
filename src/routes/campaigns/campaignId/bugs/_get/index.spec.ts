import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";
import bugs, { BugsParams } from "@src/__mocks__/database/bugs";
import bugMedia from "@src/__mocks__/database/bug_media";
import bugSeverity from "@src/__mocks__/database/bug_severity";
import bugReplicability from "@src/__mocks__/database/bug_replicability";
import bugType from "@src/__mocks__/database/bug_type";
import bugStatus from "@src/__mocks__/database/bug_status";
import CampaignMeta from "@src/__mocks__/database/campaign_meta";
import devices, { DeviceParams } from "@src/__mocks__/database/device";
import bugsReadStatus from "@src/__mocks__/database/bug_read_status";
import usecases, { UseCaseParams } from "@src/__mocks__/database/use_cases";
import tags from "@src/__mocks__/database/bug_tags";

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
  base_bug_internal_id: "BUG01",
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
const campaign_5 = {
  id: 5,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 5 title - no title rule",
  customer_title: "Campaign 5 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: project_1.id,
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
  internal_id: "BUG011",
  message: "[CON-TEXT-bike] - Bug 1 super-message",
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
  is_duplicated: 1,
  duplicated_of_id: 2,
  manufacturer: device_1.manufacturer,
  model: device_1.model,
  os: device_1.operating_system,
  os_version: device_1.os_version,
  severity_id: 1,
};

const bug_2: BugsParams = {
  id: 2,
  internal_id: "BUG012",
  message: "Bug 2 message orange",
  description: "Bug 2 description",
  expected_result: "Bug 2 expected result",
  current_result: "Bug 2 current result",
  campaign_id: campaign_1.id,
  bug_type_id: 1,
  bug_replicability_id: 3,
  status_id: 2,
  status_reason: "Bug 2 status reason",
  application_section: "Bug 2 application section",
  note: "Bug 2 note",
  wp_user_id: 1,
  is_favorite: 1,
  is_duplicated: 0,
  dev_id: device_1.id,
  manufacturer: device_1.manufacturer,
  model: device_1.model,
  os: device_1.operating_system,
  os_version: device_1.os_version,
  severity_id: 2,
};

const usecase_with_meta: UseCaseParams = {
  id: 1,
  title: "UseCase 1: titolone",
  simple_title: "titolone",
  prefix: "UseCase 1",
};

const usecase_without_meta: UseCaseParams = {
  id: 2,
  title: "UseCase 2: titolone",
};

const bug_3: BugsParams = {
  id: 3,
  internal_id: "BUG013",
  message: "Bug 3 message",
  description: "Bug 3 description",
  expected_result: "Bug 3 expected result",
  current_result: "Bug 3 current result",
  campaign_id: campaign_1.id,
  bug_type_id: 1,
  bug_replicability_id: 1,
  status_id: 1,
  status_reason: "Bug 3 status reason",
  application_section: usecase_without_meta.title,
  application_section_id: usecase_without_meta.id,
  note: "Bug 3 note",
  wp_user_id: 1,
  is_favorite: 1,
  is_duplicated: 1,
  dev_id: device_1.id,
  manufacturer: device_1.manufacturer,
  model: device_1.model,
  os: device_1.operating_system,
  os_version: device_1.os_version,
  severity_id: 2,
};

const bug_4: BugsParams = {
  id: 4,
  internal_id: "BUG014",
  message: "Bug 4 message",
  description: "Bug 4 description",
  expected_result: "Bug 4 expected result",
  current_result: "Bug 4 current result",
  campaign_id: campaign_1.id,
  bug_type_id: 1,
  bug_replicability_id: 1,
  status_id: 4,
  status_reason: "Bug 4 status reason",
  application_section: usecase_with_meta.title,
  application_section_id: usecase_with_meta.id,
  note: "Bug 4 note",
  wp_user_id: 1,
  is_favorite: 1,
  is_duplicated: 1,
  dev_id: device_1.id,
  manufacturer: device_1.manufacturer,
  model: device_1.model,
  os: device_1.operating_system,
  os_version: device_1.os_version,
  severity_id: 2,
};

const bug_5: BugsParams = {
  id: 5,
  internal_id: "BUG015",
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
  is_duplicated: 1,
  dev_id: device_1.id,
  manufacturer: device_1.manufacturer,
  model: device_1.model,
  os: device_1.operating_system,
  os_version: device_1.os_version,
  severity_id: 2,
};

const bug_6_pending: BugsParams = {
  ...bug_5,
  id: 6,
  status_id: 1, // pending
};

const bug_7: BugsParams = {
  id: 7,
  internal_id: "BUG017",
  message: "Bug 7 message",
  description: "Bug 7 description",
  expected_result: "Bug 7 expected result",
  current_result: "Bug 7 current result",
  campaign_id: campaign_5.id,
  bug_type_id: 1,
  bug_replicability_id: 1,
  status_id: 2,
  status_reason: "Bug 7 status reason",
  application_section: "Bug 7 application section",
  note: "Bug 7 note - this is a bug with no context",
  wp_user_id: 1,
  is_favorite: 1,
  is_duplicated: 1,
  dev_id: device_1.id,
  manufacturer: device_1.manufacturer,
  model: device_1.model,
  os: device_1.operating_system,
  os_version: device_1.os_version,
  severity_id: 2,
};

const bug_8_unpublished: BugsParams = {
  id: 8,
  internal_id: "BUG018",
  message: "Bug 8 message",
  description: "Bug 8 description",
  expected_result: "Bug 8 expected result",
  current_result: "Bug 8 current result",
  campaign_id: campaign_1.id,
  bug_type_id: 1,
  bug_replicability_id: 1,
  status_id: 2,
  status_reason: "Bug 8 status reason",
  application_section: "Bug 8 application section",
  note: "Bug 8 note - this is a bug with no context",
  wp_user_id: 1,
  is_favorite: 1,
  is_duplicated: 1,
  dev_id: device_1.id,
  manufacturer: device_1.manufacturer,
  model: device_1.model,
  os: device_1.operating_system,
  os_version: device_1.os_version,
  severity_id: 2,
  publish: 0,
};

const bug_9_no_tags: BugsParams = {
  id: 9,
  internal_id: "BUG019",
  message: "[CON-TEXT] - Bug 9 super-message",
  description: "Bug 9 description",
  expected_result: "Bug 9 expected result",
  current_result: "Bug 9 current result",
  campaign_id: campaign_1.id,
  bug_type_id: 1,
  bug_replicability_id: 2,
  status_id: 2,
  status_reason: "Bug 9 status reason",
  application_section: usecase_with_meta.title,
  application_section_id: usecase_with_meta.id,
  note: "Bug 9 note",
  wp_user_id: 1,
  dev_id: device_1.id,
  is_duplicated: 0,
  manufacturer: device_1.manufacturer,
  model: device_1.model,
  os: device_1.operating_system,
  os_version: device_1.os_version,
  severity_id: 4,
};

const bug_media_1 = {
  id: 123,
  bug_id: bug_1.id,
  location: "https://example.com/bug_media_1.png",
  type: "image",
  uploaded: "2021-10-19 12:57:57.0",
};

const tag_1 = {
  id: 1,
  tag_id: 1,
  display_name: "Tag 1",
  campaign_id: campaign_1.id,
  bug_id: bug_1.id,
};
const tag_2 = {
  id: 2,
  tag_id: 1,
  display_name: "Tag 1",
  campaign_id: campaign_1.id,
  bug_id: bug_2.id,
};
const tag_3 = {
  id: 3,
  tag_id: 2,
  display_name: "Tag 2",
  campaign_id: 2,
  bug_id: bug_2.id,
};
const tag_4 = {
  id: 4,
  tag_id: 3,
  display_name: "Tag 4",
  campaign_id: campaign_1.id,
  bug_id: bug_2.id,
};

describe("GET /campaigns/{cid}/bugs", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.add({
          companies: [customer_1],
          userToCustomers: [user_to_customer_1],
          projects: [project_1, project_2],
          userToProjects: [user_to_project_1],
          campaignTypes: [campaign_type_1],
          campaigns: [campaign_1, campaign_4, campaign_5],
        });
        await CampaignMeta.insert({
          meta_id: 1,
          campaign_id: campaign_1.id,
          meta_key: "bug_title_rule",
          meta_value: "1",
        });

        await bugs.insert(bug_1);
        await bugs.insert(bug_2);
        await bugs.insert(bug_3);
        await bugs.insert(bug_4);
        await bugs.insert(bug_5);
        await bugs.insert(bug_6_pending);
        await bugs.insert(bug_7);
        await bugs.insert(bug_8_unpublished);
        await bugs.insert(bug_9_no_tags);
        await bugMedia.insert(bug_media_1);
        await bugSeverity.addDefaultItems();
        await bugReplicability.addDefaultItems();
        await bugType.addDefaultItems();
        await bugStatus.addDefaultItems();
        await devices.insert(device_1);
        await usecases.insert(usecase_with_meta);
        await usecases.insert(usecase_without_meta);

        await bugsReadStatus.insert({ wp_id: 1, bug_id: bug_2.id });
        await bugsReadStatus.insert({ wp_id: 2, bug_id: bug_2.id });

        await tags.insert(tag_1);
        await tags.insert(tag_2);
        await tags.insert(tag_3);
        await tags.insert(tag_4);
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  // It should answer 200 with paginated bugs
  it("Should answer 200 with paginated bugs", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("items");
    expect(response.body).toHaveProperty("start");
    expect(response.body).toHaveProperty("limit");
    expect(response.body).toHaveProperty("size");
    expect(response.body).toHaveProperty("total");

    expect(response.body.items).toHaveLength(3);

    expect(response.body).toMatchObject(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            id: bug_9_no_tags.id,
          }),
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

  it("Should return total of bugs when paginating", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?limit=1&start=0`)
      .set("Authorization", "Bearer user");

    expect(response.body).toHaveProperty("size", 1);
    expect(response.body).toHaveProperty("total", 3);
  });

  // It should answer 403 if user is not logged in

  // Should return the items paginated by limit and start parameters
  it("Should return the items paginated by limit and start parameters", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?limit=1&start=0`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);

    expect(response.body).toMatchObject(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            id: bug_9_no_tags.id,
          }),
        ],
      })
    );
  });

  // Should order by the default order if the order is not valid or not provided
  it("Should order by the default order if the order is not valid or not provided", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?limit=10&start=0&order=abc`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            id: bug_9_no_tags.id,
          }),
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
      .set("Authorization", "Bearer user");

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
          expect.objectContaining({
            id: bug_9_no_tags.id,
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
      .set("Authorization", "Bearer user");

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
          expect.objectContaining({
            id: bug_9_no_tags.id,
          }),
        ],
      })
    );
  });

  it("Should allow ordering by severity", async () => {
    const response = await request(app)
      .get(
        `/campaigns/${campaign_1.id}/bugs?limit=10&start=0&order=DESC&orderBy=severity_id`
      )
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            id: bug_9_no_tags.id,
          }),
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

  it("Should allow filtering by not duplicates", async () => {
    const response = await request(app)
      .get(
        `/campaigns/${campaign_1.id}/bugs?limit=10&start=0&filterBy[is_duplicated]=0`
      )
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            id: bug_9_no_tags.id,
          }),
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
        `/campaigns/${campaign_1.id}/bugs?limit=10&start=0&orderBy=severity_id&order=ASC&filterBy[is_duplicated]=0`
      )
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            id: bug_2.id,
          }),
          expect.objectContaining({
            id: bug_9_no_tags.id,
          }),
        ],
      })
    );
  });

  it("Should return the context parameters for each bugs if title_rule is active and the bug has context", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs`)
      .set("Authorization", "Bearer user");
    expect(response.body.items[0].title).toEqual({
      full: bug_9_no_tags.message,
      compact: "Bug 9 super-message",
      context: ["CON-TEXT"],
    });

    expect(response.body.items[1].title).toEqual({
      full: bug_2.message,
      compact: bug_2.message,
    });

    expect(response.body.items[2].title).toEqual({
      full: bug_1.message,
      compact: "Bug 1 super-message",
      context: ["CON-TEXT-bike"],
    });
  });

  it("Should not return refused bugs", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs`)
      .set("Authorization", "Bearer user");

    expect(response.body.items.length).toBe(3);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: bug_1.id }),
        expect.objectContaining({ id: bug_2.id }),
        expect.objectContaining({ id: bug_9_no_tags.id }),
      ])
    );
  });

  it("Should not return need review bugs if option is not enabled", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs`)
      .set("Authorization", "Bearer user");

    expect(response.body.items.length).toBe(3);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: bug_1.id }),
        expect.objectContaining({ id: bug_2.id }),
        expect.objectContaining({ id: bug_9_no_tags.id }),
      ])
    );
  });

  it("Should NOT return need review bugs if option is not enabled but user is admin", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs`)
      .set("Authorization", "Bearer admin");

    expect(response.body.items.length).toBe(3);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: bug_1.id }),
        expect.objectContaining({ id: bug_2.id }),
        expect.objectContaining({ id: bug_9_no_tags.id }),
      ])
    );
  });

  it("Should return the usecase simple title if available", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs`)
      .set("Authorization", "Bearer admin");
    expect(response.body.items[0].application_section).toEqual(
      expect.objectContaining({
        id: usecase_with_meta.id,
        title: usecase_with_meta.title,
        simple_title: usecase_with_meta.simple_title,
        prefix: usecase_with_meta.prefix,
      })
    );
  });

  it("Should return need review bugs if option is enabled", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_4.id}/bugs`)
      .set("Authorization", "Bearer user");

    expect(response.body.items.length).toBe(1);
    expect(response.body.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: bug_5.id })])
    );
  });

  it("Should NOT return pending bugs", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_5.id}/bugs`)
      .set("Authorization", "Bearer user");

    expect(response.body.items.length).toBe(1);
    expect(response.body.items).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: bug_6_pending.id }),
      ])
    );
  });

  it("Should bugs without context if title_rule is not active", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_5.id}/bugs`)
      .set("Authorization", "Bearer user");
    expect(response.body).toHaveProperty("items");
    expect(response.body.items[0].title).toEqual({
      full: bug_7.message,
      compact: bug_7.message,
    });
  });

  it("Should return bugs with read/unread", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs`)
      .set("Authorization", "Bearer user");
    for (let i = 0; i < response.body.items.length; i++) {
      expect(response.body.items[i]).toHaveProperty("read");
    }
    expect(response.body.items[0]).toHaveProperty("read", false);
    expect(response.body.items[1]).toHaveProperty("read", true);
    expect(response.body.items[2]).toHaveProperty("read", false);
  });

  it("Should not return read_status prop", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs`)
      .set("Authorization", "Bearer user");
    for (let i = 0; i < response.body.items.length; i++) {
      expect(response.body.items[i]).not.toHaveProperty("read_status");
    }
  });

  it("Should return the number of siblings", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs`)
      .set("Authorization", "Bearer user");
    expect(response.body).toHaveProperty("items");
    expect(response.body.items.length).toBe(3);
    expect(
      response.body.items.find((bug: { id: number }) => bug.id === bug_1.id),
      "Bug 1 should have 1 sibling"
    ).toHaveProperty("siblings", 1);
    expect(
      response.body.items.find((bug: { id: number }) => bug.id === bug_2.id),
      "Bug 2 should have 1 sibling"
    ).toHaveProperty("siblings", 1);
    expect(
      response.body.items.find(
        (bug: { id: number }) => bug.id === bug_9_no_tags.id
      ),
      "Bug 9 should have 0 sibling"
    ).toHaveProperty("siblings", 0);
  });

  // --- End of file
});
