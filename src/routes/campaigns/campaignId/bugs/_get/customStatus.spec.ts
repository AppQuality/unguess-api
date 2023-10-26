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
import customStatuses from "@src/__mocks__/database/custom_status";
import bugCustomStatuses, {
  BugCustomStatusParams,
} from "@src/__mocks__/database/bug_custom_status";
import useCases from "@src/__mocks__/database/use_cases";
import { unguess } from "@src/features/database";

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
  status_id: 2,
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

const bug_media_1 = {
  id: 123,
  bug_id: bug_1.id,
  location: "https://example.com/bug_media_1.png",
  type: "image",
  uploaded: "2021-10-19 12:57:57.0",
};

const bug_custom_status_2: BugCustomStatusParams = {
  bug_id: bug_2.id,
  custom_status_id: 2,
};

const bug_custom_status_3: BugCustomStatusParams = {
  bug_id: bug_3.id,
  custom_status_id: 7,
};

describe("GET /campaigns/{cid}/bugs", () => {
  beforeAll(async () => {
    try {
      await dbAdapter.add({
        companies: [customer_1],
        userToCustomers: [user_to_customer_1],
        projects: [project_1],
        userToProjects: [user_to_project_1],
        campaignTypes: [campaign_type_1],
        campaigns: [campaign_1],
        custom_statuses: customStatuses.getDefaultItems(),
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

      await bugMedia.insert(bug_media_1);
      await bugSeverity.addDefaultItems();
      await bugReplicability.addDefaultItems();
      await bugType.addDefaultItems();
      await bugStatus.addDefaultItems();
      await devices.insert(device_1);
      await devices.insert(device_2);
      await devices.insert(device_3);

      await bugsReadStatus.insert({
        wp_id: 1,
        bug_id: bug_2.id,
        profile_id: 1,
      });
      await bugsReadStatus.insert({
        wp_id: 2,
        bug_id: bug_2.id,
        profile_id: 2,
      });

      await useCases.insert({ id: 1, campaign_id: campaign_1.id });
      await useCases.insert({ id: 2, campaign_id: campaign_1.id });

      await bugCustomStatuses.insert(bug_custom_status_2);
      await bugCustomStatuses.insert(bug_custom_status_3);
    } catch (error) {
      console.error(error);
    }
  });

  afterAll(async () => {
    await dbAdapter.clear();
    await CampaignMeta.clear();
    await bugs.clear();
    await bugMedia.clear();
    await bugSeverity.clear();
    await bugReplicability.clear();
    await bugType.clear();
    await bugStatus.clear();
    await bugsReadStatus.clear();
    await devices.clear();
    await useCases.clear();
    await bugCustomStatuses.clear();
  });

  // --- Start of file

  // It should return the list of bugs with the custom_status field
  it("should return the list of bugs with the custom_status field", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(3);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          custom_status: expect.objectContaining({
            id: 1,
            name: "to do",
          }),
        }),
        expect.objectContaining({
          custom_status: expect.objectContaining({
            id: 2,
            name: "pending",
          }),
        }),
        expect.objectContaining({
          custom_status: expect.objectContaining({
            id: 7,
            name: "not a bug",
          }),
        }),
      ])
    );
  });

  it("Should return the list of bugs with the custom_status field and the custom_status field should have all the required fields", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          custom_status: expect.objectContaining({
            id: expect.any(Number),
            name: expect.any(String),
            phase_id: expect.any(Number),
            color: expect.any(String),
            is_default: expect.any(Number),
          }),
        }),
      ])
    );
  });

  // --- End of file
});
