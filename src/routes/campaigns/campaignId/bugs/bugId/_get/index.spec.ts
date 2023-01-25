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
import tags from "@src/__mocks__/database/bug_tags";
import devices, { DeviceParams } from "@src/__mocks__/database/device";
import additionalField, {
  CampaingAdditionalFieldsParams,
} from "@src/__mocks__/database/campaign_additional_field";
import additionalFieldData from "@src/__mocks__/database/campaign_additional_field_data";
import CampaignMeta from "@src/__mocks__/database/campaign_meta";
import useCases, { UseCaseParams } from "@src/__mocks__/database/use_cases";
import readStatus from "@src/__mocks__/database/bug_read_status";

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
  title: "Campaign 998 title",
  customer_title: "Campaign 998 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: project_2.id,
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

const device_2: DeviceParams = {
  id: 13,
  manufacturer: "Apple",
  model: "iPhone 13",
  platform_id: 8,
  id_profile: 59455,
  os_version: "Windows 10 May 2021 Update",
  operating_system: "Windows",
  form_factor: "PC",
  pc_type: "Notebook",
};

const usecase_1: UseCaseParams = {
  id: 1,
  title: "Use Case 1: something to do here",
  simple_title: "something to do here",
  prefix: "Use Case 1:",
};

const profile_1 = {
  id: 32,
  name: "Tester 1",
  wp_user_id: 1,
};

const profile_2 = {
  id: 34,
  name: "Deleted User",
  wp_user_id: 13,
};

const bug_1: BugsParams = {
  id: 12999,
  internal_id: "UG12999",
  wp_user_id: 1,
  message: "[CON-TEXT][2ndContext] - Bug 12-999 message",
  description: "Bug 12999 description",
  expected_result: "Bug 12999 expected result",
  current_result: "Bug 12999 actual result",
  campaign_id: campaign_1.id,
  status_id: 2,
  created: "2021-10-19 12:57:57.0",
  updated: "2021-10-19 12:57:57.0",
  dev_id: device_1.id,
  severity_id: 1,
  bug_replicability_id: 1,
  bug_type_id: 1,
  application_section_id: usecase_1.id,
  application_section: usecase_1.title,
  note: "Bug 12999 notes",
  manufacturer: device_1.manufacturer,
  model: device_1.model,
  os: device_1.operating_system,
  os_version: device_1.os_version,
};

const bug_2 = {
  ...bug_1,
  id: 13000,
  dev_id: device_2.id,
  manufacturer: device_2.manufacturer,
  model: device_2.model,
  os: device_2.operating_system,
  os_version: device_2.os_version,
  application_section_id: 0,
  application_section: "Not a specific usecase",
};

const bug_3_pending = {
  ...bug_1,
  id: 13001,
  status_id: 1, // pending
};

const bug_34 = {
  ...bug_1,
  id: 13401,
};

const bug_4 = {
  ...bug_1,
  id: 13002,
  wp_user_id: profile_2.wp_user_id,
};

const bug_5_from_unknown = {
  ...bug_1,
  id: 13003,
  campaign_id: campaign_2.id,
  wp_user_id: 999,
};

const bug_media_1 = {
  id: 123,
  bug_id: bug_1.id,
  location: "https://example.com/bug_media_1.png",
  type: "image",
  uploaded: "2021-10-19 12:57:57.0",
};
const bug_media_other_type = {
  id: 1234,
  bug_id: bug_34.id,
  location: "https://example.com/bug_media_other_type.png",
  type: "application/vnd.ms-office",
  uploaded: "2021-10-19 12:57:57.0",
};

const tag_1 = {
  id: 1,
  bug_id: bug_1.id,
  display_name: "Tag visibile",
  is_public: 1,
};

const tag_2 = {
  id: 2,
  bug_id: bug_1.id,
  display_name: "Tag privato",
  is_public: 0,
};

const field_1 = {
  id: 123,
  cp_id: bug_1.campaign_id,
  title: "product_code",
  validation: ".",
};

const field_1_data = {
  bug_id: bug_1.id,
  type_id: field_1.id,
  value: "ENELXXX",
};

const field_2: CampaingAdditionalFieldsParams = {
  id: 124,
  cp_id: bug_1.campaign_id,
  title: "browser",
  validation: "Chrome;Firefox",
  type: "select",
};

const field_2_data = {
  bug_id: bug_1.id,
  type_id: field_2.id,
  value: "Chrome",
};

describe("GET /campaigns/{cid}/bugs/{bid}", () => {
  beforeEach(async () => {
    await dbAdapter.add({
      companies: [customer_1],
      profiles: [profile_1, profile_2],
      userToCustomers: [user_to_customer_1],
      projects: [project_1, project_2],
      userToProjects: [user_to_project_1],
      campaignTypes: [campaign_type_1],
      campaigns: [campaign_1, campaign_2],
    });

    await bugs.insert(bug_1);
    await bugs.insert(bug_2);
    await bugs.insert(bug_3_pending);
    await bugs.insert(bug_34);
    await bugs.insert(bug_4);
    await bugs.insert(bug_5_from_unknown);
    await devices.insert(device_1);
    await devices.insert(device_2);
    await bugMedia.insert(bug_media_1);
    await bugMedia.insert(bug_media_other_type);
    await tags.insert(tag_1);
    await tags.insert(tag_2);
    await additionalField.insert(field_1);
    await additionalField.insert(field_2);
    await additionalFieldData.insert(field_1_data);
    await additionalFieldData.insert(field_2_data);
    await useCases.insert(usecase_1);

    await bugSeverity.addDefaultItems();
    await bugReplicability.addDefaultItems();
    await bugType.addDefaultItems();
    await bugStatus.addDefaultItems();
    await CampaignMeta.insert({
      meta_id: 1,
      campaign_id: campaign_1.id,
      meta_key: "bug_title_rule",
      meta_value: "1",
    });
  });

  afterEach(async () => {
    await dbAdapter.clear();
    await bugs.clear();
    await devices.clear();
    await bugMedia.clear();
    await tags.clear();
    await additionalField.clear();
    await additionalFieldData.clear();
    await useCases.clear();
    await CampaignMeta.clear();
    await bugSeverity.clear();
    await bugReplicability.clear();
    await bugType.clear();
    await bugStatus.clear();
  });

  // It should answer 403 if user is not logged in
  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).get(
      `/campaigns/${campaign_1.id}/bugs/${bug_1.id}`
    );
    expect(response.status).toBe(403);
  });

  // It should answer 400 if campaign does not exist
  it("Should answer 400 if campaign does not exist", async () => {
    const response = await request(app)
      .get(`/campaigns/999999/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  // It should answer 403 if the user has no permissions to see the campaign
  it("Should answer 400 if the user has no permissions to see the campaign", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_2.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  // It should answer 200 with the campaign
  it("Should answer 200 with the bug", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: bug_1.id,
        status: expect.objectContaining({
          id: bug_1.status_id,
          name: "Approved",
        }),
        severity: expect.objectContaining({
          id: bug_1.severity_id,
          name: "LOW",
        }),
        replicability: expect.objectContaining({
          id: bug_1.bug_replicability_id,
          name: "Sometimes",
        }),
        type: expect.objectContaining({
          id: bug_1.bug_type_id,
          name: "Crash",
        }),
      })
    );

    expect(response.body.media.length).toEqual(1);
  });

  // It should answer 400 if an invalid campaign id is provided
  it("Should answer 400 if an invalid campaign id is provided", async () => {
    const response = await request(app)
      .get(`/campaigns/invalid/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should answer 400 if an invalid bug id is provided", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/invalid`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  // If smartphone, should return manufacturer and model
  it("Should return manufacturer and model if smartphone", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);

    expect(response.body.device).toEqual(
      expect.objectContaining({
        manufacturer: device_1.manufacturer,
        model: device_1.model,
        type: "smartphone",
      })
    );
  });

  it("Should NOT return manufacturer and model if desktop, bug desktop_type", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_2.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);

    expect(response.body.device.manufacture).toBeUndefined();
    expect(response.body.device.model).toBeUndefined();

    expect(response.body.device).toEqual(
      expect.objectContaining({
        desktop_type: "Notebook",
        os: device_2.operating_system,
        os_version: device_2.os_version,
        type: "desktop",
      })
    );
  });

  it("Should return an empty array if the bug has no media", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_2.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);

    expect(response.body.media).toEqual([]);
  });
  it("Should return accepted bug media type", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_34.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(
      ["image", "video", "other"].includes(
        response.body.media[0].mime_type.type
      )
    ).toEqual(true);
  });

  //Should return a list of tags if available
  it("Should return a list of tags if available", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);

    expect(response.body.tags.length).toEqual(1);
    expect(response.body.tags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: tag_1.id,
          name: tag_1.display_name,
        }),
      ])
    );
  });

  //Should return a list of additional fields if available
  it("Should return all available additional fields", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);

    expect(response.body.additional_fields.length).toEqual(2);
  });

  it("Should recognize regex additional fields", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);

    expect(response.body.additional_fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: field_1.title,
          value: field_1_data.value,
          kind: "regex",
        }),
      ])
    );
  });

  it("Should return context parameters if title rule is active and bug title has context", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body.title).toEqual(
      expect.objectContaining({
        full: "[CON-TEXT][2ndContext] - Bug 12-999 message",
        compact: "Bug 12-999 message",
        context: ["CON-TEXT", "2ndContext"],
      })
    );
  });

  it("Should recognize regex additional fields", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);

    expect(response.body.additional_fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: field_2.title,
          value: field_2_data.value,
          options: ["Chrome", "Firefox"],
          kind: "select",
        }),
      ])
    );
  });

  it("Should answer 400 if the bug requested is in a state not allowed", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_3_pending.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should answer 200 and usecase meta details if available", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body.application_section).toEqual({
      id: usecase_1.id,
      title: usecase_1.title,
      simple_title: usecase_1.simple_title,
      prefix: usecase_1.prefix,
    });
  });

  it("Should not return usecase meta when there are none", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_2.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);

    const usecase = response.body.application_section;

    expect(usecase.title).toEqual(bug_2.application_section);
    expect(usecase.simple_title).toBeUndefined();
    expect(usecase.prefix).toBeUndefined();
  });

  it("Should return tester details as tester id and name", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body.reporter).toEqual({
      tester_id: profile_1.id,
      name: profile_1.name,
    });
  });

  it("Should return tester details if user is deleted user", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_4.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body.reporter).toEqual({
      tester_id: profile_2.id,
      name: "Deleted User",
    });
  });

  it("Should return unknown if the tester doesn't exists", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_2.id}/bugs/${bug_5_from_unknown.id}`)
      .set("Authorization", "Bearer admin");
    expect(response.status).toBe(200);
    expect(response.body.reporter).toEqual({
      tester_id: 0,
      name: "Unknown",
    });
  });

  it("Should raise an error if the bug_id required is from another cp", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_5_from_unknown.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should set the bug as read if the user when returning a bug", async () => {
    const statusBeforeGet = await readStatus.all(undefined, [
      {
        wp_id: 1,
        bug_id: 1,
        is_read: 1,
      },
    ]);
    expect(statusBeforeGet.length).toBe(0);
    await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user");

    const statusAfterGet = await readStatus.all(undefined, [
      {
        wp_id: 1,
        bug_id: 1,
        is_read: 1,
      },
    ]);
    expect(statusAfterGet.length).toBe(1);

    await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user");

    const statusAfterSecondGet = await readStatus.all(undefined, [
      {
        wp_id: 1,
        bug_id: 1,
        is_read: 1,
      },
    ]);
    expect(statusAfterSecondGet.length).toBe(1);
  });
  /** --- end of file */
});
