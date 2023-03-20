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
import tags from "@src/__mocks__/database/bug_tags";
import useCases from "@src/__mocks__/database/use_cases";

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

const device_1: DeviceParams = {
  id: 12,
  manufacturer: "Apple",
  model: "iPhone 13",
  platform_id: 2,
  id_profile: 61042,
  os_version: "iOS 18 (18)",
  operating_system: "iOS",
  form_factor: "Smartphone",
};

const device_2: DeviceParams = {
  id: 15,
  manufacturer: "Apple",
  model: "iPhone 11",
  platform_id: 2,
  id_profile: 61042,
  os_version: "iOS 16 (16)",
  operating_system: "iOS",
  form_factor: "Smartphone",
};

const device_3: DeviceParams = {
  id: 60,
  platform_id: 8,
  id_profile: 61042,
  os_version: "Windows 10 April 2018 Update (17134.191)",
  operating_system: "Windows",
  form_factor: "PC",
  pc_type: "Notebook",
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
  dev_id: device_2.id,
  is_duplicated: 1,
  manufacturer: device_2.manufacturer,
  model: device_2.model,
  os: device_2.operating_system,
  os_version: device_2.os_version,
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
  bug_type_id: 2,
  bug_replicability_id: 3,
  status_id: 2,
  status_reason: "Bug 2 status reason",
  application_section: "Bug 2 application section",
  note: "Bug 2 note",
  wp_user_id: 1,
  is_favorite: 1,
  is_duplicated: 0,
  dev_id: device_3.id,
  manufacturer: device_3.manufacturer,
  model: device_3.model,
  os: device_3.operating_system,
  os_version: device_3.os_version,
  severity_id: 2,
  application_section_id: 2,
};

const bug_3: BugsParams = {
  id: 3,
  internal_id: "BUG013",
  message: "Bug 3 message",
  description: "Bug 3 description",
  expected_result: "Bug 3 expected result",
  current_result: "Bug 3 current result",
  campaign_id: campaign_1.id,
  bug_type_id: 3,
  bug_replicability_id: 1,
  status_id: 1,
  status_reason: "Bug 3 status reason",
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
  bug_type_id: 3,
  bug_replicability_id: 1,
  status_id: 4,
  status_reason: "Bug 4 status reason",
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

const bug_8_unpublished: BugsParams = {
  id: 8,
  internal_id: "BUG018",
  message: "Bug 8 message",
  description: "Bug 8 description",
  expected_result: "Bug 8 expected result",
  current_result: "Bug 8 current result",
  campaign_id: campaign_1.id,
  bug_type_id: 3,
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
  bug_type_id: 3,
  bug_replicability_id: 2,
  status_id: 2,
  status_reason: "Bug 9 status reason",
  note: "Bug 9 note",
  wp_user_id: 1,
  dev_id: device_1.id,
  is_duplicated: 0,
  manufacturer: device_1.manufacturer,
  model: device_1.model,
  os: device_1.operating_system,
  os_version: device_1.os_version,
  severity_id: 4,
  application_section_id: 1,
};

const bug_55: BugsParams = {
  id: 55,
  internal_id: "BUG055",
  message: "[Example] - Bug ",
  description: "Bug description",
  expected_result: "Bug expected result",
  current_result: "Bug current result",
  campaign_id: campaign_1.id,
  bug_type_id: 3,
  bug_replicability_id: 1,
  status_id: 2,
  status_reason: "Bug status reason",
  note: "Bug note",
  wp_user_id: 1,
  dev_id: device_1.id,
  is_duplicated: 0,
  manufacturer: device_1.manufacturer,
  model: device_1.model,
  os: device_1.operating_system,
  os_version: device_1.os_version,
  severity_id: 2,
  application_section_id: 1,
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
          projects: [project_1],
          userToProjects: [user_to_project_1],
          campaignTypes: [campaign_type_1],
          campaigns: [campaign_1],
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
        await bugs.insert(bug_8_unpublished);
        await bugs.insert(bug_9_no_tags);
        await bugs.insert(bug_55);
        await bugMedia.insert(bug_media_1);
        await bugSeverity.addDefaultItems();
        await bugReplicability.addDefaultItems();
        await bugType.addDefaultItems();
        await bugStatus.addDefaultItems();
        await devices.insert(device_1);
        await devices.insert(device_2);
        await devices.insert(device_3);

        await bugsReadStatus.insert({ wp_id: 1, bug_id: bug_2.id });
        await bugsReadStatus.insert({ wp_id: 2, bug_id: bug_2.id });

        await tags.insert(tag_1);
        await tags.insert(tag_2);
        await tags.insert(tag_4);

        await useCases.insert({ id: 1, campaign_id: campaign_1.id });
        await useCases.insert({ id: 2, campaign_id: campaign_1.id });
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });
  // Should return the normal results if the filterBy is not accepted
  it("Should ignore filterBy if is not valid", async () => {
    const response = await request(app)
      .get(
        `/campaigns/${campaign_1.id}/bugs?limit=10&start=0&filterBy[abc]=abc`
      )
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject(
      expect.objectContaining({
        items: [
          expect.objectContaining({
            id: bug_55.id,
          }),
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

  it("Should return only read bugs if filterBy has read filter as true", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?filterBy[read]=true`)
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(1);
  });

  it("Should return only unread bugs if filterBy has read filter as false", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?filterBy[read]=false`)
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(3);
  });

  it("It should only return bugs read by the user if filterBy read the filter as true", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?filterBy[read]=true`)
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(1);
    expect(response.body.items[0]).toHaveProperty("id", 2);
  });

  //Should return bugs with specific tags
  it("Should return bugs filtered by tags (bugs containing one of the tags in filter)", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?filterBy[tags]=1,3`)
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(2);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: bug_1.id,
        }),
        expect.objectContaining({
          id: bug_2.id,
        }),
      ])
    );
  });

  it("Should return bugs filtered by tags ignoring invalid tags", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?filterBy[tags]=1,3,pippo`)
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(2);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: bug_1.id,
        }),
        expect.objectContaining({
          id: bug_2.id,
        }),
      ])
    );
  });

  it("Should allow combining no tag with valid tags", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?filterBy[tags]=3,none`)
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(3);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: bug_9_no_tags.id }),
        expect.objectContaining({ id: bug_55.id }),
        expect.objectContaining({ id: bug_2.id }),
      ])
    );
  });
  
  it("Should return bugs filtered by notags", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?filterBy[tags]=none`)
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(2);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: bug_9_no_tags.id }),
        expect.objectContaining({ id: bug_55.id }),
      ])
    );
    expect(response.body.items[0].tags).toBeUndefined();
  });

  it("Should return bugs filtered by severities ids", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?filterBy[severities]=1,4`)
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(2);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: bug_9_no_tags.id }),
        expect.objectContaining({ id: bug_1.id }),
      ])
    );
  });

  it("Should return bugs filtered by replicabilities ids", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?filterBy[replicabilities]=2,3`)
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(2);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: bug_2.id }),
        expect.objectContaining({ id: bug_9_no_tags.id }),
      ])
    );
  });

  it("Should return bugs filtered by type ids", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?filterBy[types]=1,2`)
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(2);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: bug_1.id }),
        expect.objectContaining({ id: bug_2.id }),
      ])
    );
  });

  it("Should return bugs filtered by search (search by bugID)", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?search=9`)
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(1);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: bug_9_no_tags.id }),
      ])
    );
  });

  it("Should return bugs filtered by search (search by title)", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?search=orange`)
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(1);
    expect(response.body.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: bug_2.id })])
    );
  });

  it("Should return bugs filtered by search (search by context)", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?search=CON-TEXT-bike`)
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(1);
    expect(response.body.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: bug_1.id })])
    );
  });

  it("Should allow filtering multiple filterby, combining them in AND", async () => {
    const response = await request(app)
      .get(
        `/campaigns/${campaign_1.id}/bugs?filterBy[replicabilities]=2,3&filterBy[severities]=4`
      )
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(1);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: bug_9_no_tags.id }),
      ])
    );
  });

  it("Should allow mixing filterby and search, combining them in AND", async () => {
    const response = await request(app)
      .get(
        `/campaigns/${campaign_1.id}/bugs?filterBy[replicabilities]=2,3&search=CON-TEXT`
      )
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(1);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: bug_9_no_tags.id }),
      ])
    );
  });

  it("Should allow searching by internal id", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?search=BUG011`)
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(1);
    expect(response.body.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: bug_1.id })])
    );
  });

  it("Should allow searching by id", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?search=1`)
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(1);
    expect(response.body.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: bug_1.id })])
    );
  });

  it("Search by id should match partials", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?search=5`)
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(1);
    expect(response.body.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: bug_55.id })])
    );
  });

  it("Should return all bugs if filter by invalid tag", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?filterBy[tags]=invalid`)
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(4);
  });

  it("Should return allow filtering by smartphone device", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?filterBy[devices]=Apple iPhone 11`)
      .set("Authorization", "Bearer user");
    expect(response.body).toHaveProperty("items");
    expect(response.body.items.length).toBe(1);
    expect(response.body.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: bug_1.id })])
    );
  });

  it("Should return allow filtering by pc device", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?filterBy[devices]=Notebook`)
      .set("Authorization", "Bearer user");
    expect(response.body).toHaveProperty("items");
    expect(response.body.items.length).toBe(1);
    expect(response.body.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: bug_2.id })])
    );
  });

  it("Should return bugs filtered by multiple device", async () => {
    const response = await request(app)
      .get(
        `/campaigns/${campaign_1.id}/bugs?filterBy[devices]=Apple iPhone 11,Notebook`
      )
      .set("Authorization", "Bearer user");
    expect(response.body).toHaveProperty("items");
    expect(response.body.items.length).toBe(2);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: bug_1.id }),
        expect.objectContaining({ id: bug_2.id }),
      ])
    );
  });

  it("Should return bugs filtered by os", async () => {
    const response = await request(app)
      .get(
        `/campaigns/${campaign_1.id}/bugs?filterBy[os]=Windows Windows 10 April 2018 Update (17134.191)`
      )
      .set("Authorization", "Bearer user");

    expect(response.body).toHaveProperty("items");
    expect(response.body.items.length).toBe(1);
    expect(response.body.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: bug_2.id })])
    );
  });

  it("Should return bugs filtered by multiple os", async () => {
    const response = await request(app)
      .get(
        `/campaigns/${campaign_1.id}/bugs?filterBy[os]=iOS iOS 16 (16),Windows Windows 10 April 2018 Update (17134.191)`
      )
      .set("Authorization", "Bearer user");

    expect(response.body).toHaveProperty("items");
    expect(response.body.items.length).toBe(2);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: bug_1.id }),
        expect.objectContaining({ id: bug_2.id }),
      ])
    );
  });

  it("Should return bugs filtered by multiple os ignoring non-existent os", async () => {
    const response = await request(app)
      .get(
        `/campaigns/${campaign_1.id}/bugs?filterBy[os]=unguess os,iOS iOS 16 (16)`
      )
      .set("Authorization", "Bearer user");

    expect(response.body).toHaveProperty("items");
    expect(response.body.items.length).toBe(1);
    expect(response.body.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: bug_1.id })])
    );
  });

  it("Should return bugs filtered by multiple usecases", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?filterBy[usecases]=1,2`)
      .set("Authorization", "Bearer user");

    expect(response.body).toHaveProperty("items");
    expect(response.body.items.length).toBe(3);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: bug_9_no_tags.id }),
        expect.objectContaining({ id: bug_55.id }),
        expect.objectContaining({ id: bug_2.id }),
      ])
    );
  });

  it("Should return bugs filtered by not a specific usecase", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?filterBy[usecases]=-1`)
      .set("Authorization", "Bearer user");

    expect(response.body).toHaveProperty("items");
    expect(response.body.items.length).toBe(1);
    expect(response.body.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: bug_1.id })])
    );
  });

  it("Should return bugs filtered by usecase ignoring invalid values", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs?filterBy[usecases]=-1,apple`)
      .set("Authorization", "Bearer user");

    expect(response.body).toHaveProperty("items");
    expect(response.body.items.length).toBe(1);
    expect(response.body.items).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: bug_1.id })])
    );
  });
  // --- End of file
});
