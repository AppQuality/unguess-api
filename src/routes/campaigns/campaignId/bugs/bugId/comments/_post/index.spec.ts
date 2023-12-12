import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";
import bugType from "@src/__mocks__/database/bug_type";
import bugs, { BugsParams } from "@src/__mocks__/database/bugs";
import severities from "@src/__mocks__/database/bug_severity";
import replicabilities from "@src/__mocks__/database/bug_replicability";
import statuses from "@src/__mocks__/database/bug_status";
import devices, { DeviceParams } from "@src/__mocks__/database/device";
import usecases, { UseCaseParams } from "@src/__mocks__/database/use_cases";
import bug_tags from "@src/__mocks__/database/bug_tags";
import bug_priorities from "@src/__mocks__/database/bug_priority";
import priorities from "@src/__mocks__/database/priority";
import bug_custom_statuses from "@src/__mocks__/database/bug_custom_status";
import custom_status from "@src/__mocks__/database/custom_status";
import { tryber, unguess } from "@src/features/database";
import { useBasicProjectsContext } from "@src/features/db/hooks/basicProjects";

const campaign_type_1 = {
  id: 1,
  name: "Functional Testing (Bug Hunting)",
  type: FUNCTIONAL_CAMPAIGN_TYPE_ID,
  category_id: 0,
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
  platform_id: 1,
  page_preview_id: -1,
  page_manual_id: -1,
  customer_id: -1,
  pm_id: -1,
  description: "Campaign description",
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
  platform_id: 1,
  page_preview_id: -1,
  page_manual_id: -1,
  customer_id: -1,
  pm_id: -1,
  description: "Campaign description",
};

const device_1: DeviceParams = {
  id: 12,
  manufacturer: "Apple",
  model: "iPhone 13",
  platform_id: 2,
  id_profile: 1,
  os_version: "iOS 16 (16)",
  operating_system: "iOS",
  form_factor: "Smartphone",
};

const usecase_1: UseCaseParams = {
  id: 1,
  title: "Use Case 1: something to do here",
  simple_title: "something to do here",
  prefix: "Use Case 1:",
};

const bug_1 = {
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
  status_reason: "Bug 1 status reason",
  is_duplicated: 1,
  duplicated_of_id: 2,
  reviewer: 2,
  last_editor_id: 1,
};

const bug_2 = {
  id: 2,
  internal_id: "UG2",
  wp_user_id: 1,
  message: "[CON-TEXT][2ndContext] - Bug 12-999 message",
  description: "Bug 12999 description",
  expected_result: "Bug 12999 expected result",
  current_result: "Bug 12999 actual result",
  campaign_id: campaign_2.id,
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
  status_reason: "Bug 1 status reason",
  is_duplicated: 1,
  duplicated_of_id: 2,
  reviewer: 2,
  last_editor_id: 1,
};

const bug_3 = {
  id: 3,
  internal_id: "UG13",
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
  status_reason: "Bug 1 status reason",
  is_duplicated: 1,
  duplicated_of_id: 2,
  reviewer: 2,
  last_editor_id: 1,
};

describe("POST /campaigns/{cid}/bugs/{bid}/comments", () => {
  const context = useBasicProjectsContext();

  beforeAll(async () => {
    await tryber.tables.WpAppqCampaignType.do().insert(campaign_type_1);
    await tryber.tables.WpAppqEvdCampaign.do().insert([
      { ...campaign_1, project_id: context.prj1.id },
      { ...campaign_2, project_id: context.prj2.id },
    ]);

    await bugType.addDefaultItems();
    await severities.addDefaultItems();
    await replicabilities.addDefaultItems();
    await statuses.addDefaultItems();

    await tryber.tables.WpAppqEvdBug.do().insert([bug_1, bug_2, bug_3]);

    await unguess.tables.UgBugsComments.do().insert({
      text: "Comment 1",
      is_deleted: 0,
      bug_id: bug_1.id,
      creator_id: context.profile2.id,
      creation_date_utc: "2023-12-11 09:23:00",
    });
  });

  afterAll(async () => {
    await bugType.clear();
    await severities.clear();
    await replicabilities.clear();
    await statuses.clear();
  });

  // It should answer 403 if user is not logged in
  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).post(
      `/campaigns/${campaign_1.id}/bugs/${bug_1.id}/comments`
    );

    expect(response.status).toBe(403);
  });

  // It should fail if the campaign does not exist
  it("Should fail if the campaign does not exist", async () => {
    const response = await request(app)
      .post(`/campaigns/999/bugs/666/comments`)
      .set("Authorization", "Bearer user")
      .send({ text: "comment text" });

    expect(response.status).toBe(400);
  });

  // It should fail if the bug does not exist
  it("Should fail if the bug does not exist", async () => {
    const response = await request(app)
      .post(`/campaigns/${campaign_1.id}/bugs/666/comments`)
      .set("Authorization", "Bearer user")
      .send({ text: "comment text" });

    expect(response.status).toBe(400);
  });

  // It should fail if the user is not the owner
  it("Should fail if the user is not the owner", async () => {
    const response = await request(app)
      .post(`/campaigns/${campaign_2.id}/bugs/${bug_2.id}/comments`)
      .set("Authorization", "Bearer user")
      .send({ text: "comment text" });

    expect(response.status).toBe(403);
  });

  it("Should fail if the body is not provider", async () => {
    const response = await request(app)
      .post(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}/comments`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(400);
  });

  //Should answer 200 if the user is the owner and a valid body is sent
  it("Should answer 200 if the user is the owner and a valid body is sent", async () => {
    const response = await request(app)
      .post(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}/comments`)
      .set("Authorization", "Bearer user")
      .send({ text: "comment text" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  it("Should answer 200 with the comment", async () => {
    const response = await request(app)
      .post(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}/comments`)
      .set("Authorization", "Bearer user")
      .send({ text: "comment text" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        text: "comment text",
        creator: {
          id: context.profile1.id,
          name: `${context.profile1.name} ${context.profile1.surname}`,
        },
      })
    );
  });

  //Should return a valid iso date
  it("Should return a valid iso date", async () => {
    const response = await request(app)
      .post(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}/comments`)
      .set("Authorization", "Bearer user")
      .send({ text: "comment text" });

    expect(response.status).toBe(200);
    expect(response.body.creation_date).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
    );
  });

  // --- End of file
});
