import { zonedTimeToUtc } from "date-fns-tz";
import app from "@src/app";
import request from "supertest";
import { tryber, unguess } from "@src/features/database";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";
import { UseCaseParams } from "@src/__mocks__/database/use_cases";
import { BugsParams } from "@src/__mocks__/database/bugs";

const customer_1 = {
  id: 999,
  company: "Company 999",
  company_logo: "logo999.png",
  tokens: 100,
  pm_id: 265,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 999,
};

const project_1 = {
  id: 999,
  display_name: "Project 999",
  customer_id: 999,
  edited_by: 125,
};

const project_2 = {
  id: 998,
  display_name: "Project 998",
  customer_id: 10,
  edited_by: 126,
};

const user_to_project_1 = {
  wp_user_id: 1,
  project_id: 999,
};

const campaign_type_1 = {
  id: 999,
  name: "Functional Testing (Bug Hunting)",
  type: FUNCTIONAL_CAMPAIGN_TYPE_ID,
  category_id: 12,
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
  platform_id: 23,
  page_preview_id: 13,
  page_manual_id: 14,
  customer_id: customer_1.id,
  pm_id: 265,
};

const campaign_2 = {
  ...campaign_1,
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

const device_1 = {
  id: 12,
  manufacturer: "Apple",
  model: "iPhone 13",
  platform_id: 2,
  id_profile: 61042,
  os_version: "iOS 16 (16)",
  operating_system: "iOS",
  form_factor: "Smartphone",
};

const device_2 = {
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
  id: 1,
  name: "Tester",
  surname: "1255",
  wp_user_id: 1,
  email: "mail@gmail.com",
  employment_id: 265,
  education_id: 152,
};

const profile_2 = {
  id: 34,
  name: "Tester 2",
  surname: "Tester 2",
  wp_user_id: 13,
  email: "mail2@gmail.com",
  employment_id: 4876671,
  education_id: 152,
};

const bug_1: BugsParams = {
  id: 12999,
  internal_id: "UG12999",
  wp_user_id: 1,
  profile_id: profile_1.id,
  message: "[CON-TEXT][2ndContext] - Bug 12-999 message",
  description: "Bug 12999 description",
  expected_result: "Bug 12999 expected result",
  current_result: "Bug 12999 actual result",
  campaign_id: campaign_1.id,
  status_id: 2,
  reviewer: 1,
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
  last_editor_id: 1,
};

const bug_2 = {
  ...bug_1,
  wp_user_id: 34,
  profile_id: profile_2.id,
  id: 999999,
  campaign_id: campaign_2.id,
  dev_id: device_2.id,
  manufacturer: device_2.manufacturer,
  model: device_2.model,
  os: device_2.operating_system,
  os_version: device_2.os_version,
  application_section_id: 0,
  application_section: "Not a specific usecase",
};

const bug_3 = {
  ...bug_1,
  campaign_id: campaign_2.id,
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
  profile_id: profile_2.id,
};

const comment_1 = {
  id: 2654,
  text: "comment 1",
  bug_id: bug_1.id,
  profile_id: 1,
  creation_date_utc: "2021-10-19 12:57:57.0",
  is_deleted: 0,
};
const comment_2 = {
  id: 24562,
  text: "comment 2",
  bug_id: bug_2.id,
  profile_id: 34,
  creation_date_utc: "2021-10-19 12:57:57.0",
  is_deleted: 0,
};
const comment_3 = {
  id: 23547,
  text: "comment 3",
  bug_id: bug_3.id,
  profile_id: 1,
  creation_date_utc: "2021-10-19 12:57:57.0",
  is_deleted: 0,
};

describe("GET /campaigns/{cid}/bugs/{bid}/comments", () => {
  beforeAll(async () => {
    await tryber.tables.WpAppqEvdBug.do().insert([
      bug_1,
      bug_2,
      bug_3,
      bug_34,
      bug_4,
    ]);
    await tryber.tables.WpAppqEvdProfile.do().insert([profile_1, profile_2]);
    await tryber.tables.WpAppqCustomer.do().insert(customer_1);
    await tryber.tables.WpAppqUserToCustomer.do().insert(user_to_customer_1);
    await tryber.tables.WpAppqProject.do().insert([project_1, project_2]);
    await tryber.tables.WpAppqUserToProject.do().insert(user_to_project_1);
    await tryber.tables.WpAppqCampaignType.do().insert(campaign_type_1);
    await tryber.tables.WpAppqEvdCampaign.do().insert([campaign_1, campaign_2]);
    await tryber.tables.WpCrowdAppqDevice.do().insert([device_1, device_2]);
    await unguess.tables.UgBugsComments.do().insert([
      comment_1,
      comment_2,
      comment_3,
    ]);
  });

  afterAll(async () => {
    await tryber.tables.WpAppqEvdBug.do().delete();
    await tryber.tables.WpAppqEvdCampaign.do().delete();
    await tryber.tables.WpAppqCampaignType.do().delete();
    await tryber.tables.WpAppqUserToProject.do().delete();
    await tryber.tables.WpAppqProject.do().delete();
    await tryber.tables.WpAppqUserToCustomer.do().delete();
    await tryber.tables.WpAppqCustomer.do().delete();
    await tryber.tables.WpCrowdAppqDevice.do().delete();
    await tryber.tables.WpAppqEvdProfile.do().delete();
    await unguess.tables.UgBugsComments.do().delete();
  });

  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).get(
      `/campaigns/${campaign_1.id}/bugs/${bug_1.id}/comments`
    );
    expect(response.status).toBe(403);
  });

  // It should answer 400 if campaign does not exist
  it("Should answer 400 if campaign does not exist", async () => {
    const response = await request(app)
      .get(`/campaigns/99999/bugs/${bug_1.id}/comments`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  // It should answer 400 if bug does not exist
  it("Should answer 400 if bug does not exist", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/8512/comments`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  // It should answer 403 if the campaign exists but the user has no permissions to see the campaign
  it("Should answer 403 if the campaign exists but the user has no permissions to see the campaign", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_2.id}/bugs/${bug_2.id}/comments`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(403);
  });

  // It should answer 200 with the campaign if the user is an admin
  it("Should answer 200 with all the comments for the bug if the user is an admin", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}/comments`)
      .set("Authorization", "Bearer admin");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      items: [
        {
          id: comment_1.id,
          text: comment_1.text,
          bug_id: bug_1.id,
          creator: {
            id: profile_1.wp_user_id,
            name: `${profile_1.name} ${profile_1.surname}`,
          },
          creation_date: zonedTimeToUtc(
            comment_1.creation_date_utc,
            "UTC"
          ).toISOString(),
        },
      ],
    });
  });

  // Should answer 200 with the comment if the user has specific permission to see the campaign
  it("Should answer 200 with all the comments for the bug if the user has specific permission to see the campaign", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}/comments`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      items: [
        {
          id: comment_1.id,
          text: comment_1.text,
          bug_id: bug_1.id,
          creator: {
            id: profile_1.wp_user_id,
            name: `${profile_1.name} ${profile_1.surname}`,
          },
          creation_date: zonedTimeToUtc(
            comment_1.creation_date_utc,
            "UTC"
          ).toISOString(),
        },
      ],
    });
  });
});
