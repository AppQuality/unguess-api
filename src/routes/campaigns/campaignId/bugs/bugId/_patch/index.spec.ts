import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";
import bugType from "@src/__mocks__/database/bug_type";
import bugs, { BugsParams } from "@src/__mocks__/database/bugs";
import * as db from "@src/features/db";
import severities from "@src/__mocks__/database/bug_severity";
import replicabilities from "@src/__mocks__/database/bug_replicability";
import statuses from "@src/__mocks__/database/bug_status";
import devices, { DeviceParams } from "@src/__mocks__/database/device";
import usecases, { UseCaseParams } from "@src/__mocks__/database/use_cases";

const campaign_type_1 = {
  id: 1,
  name: "Functional Testing (Bug Hunting)",
  type: FUNCTIONAL_CAMPAIGN_TYPE_ID,
};
const customer_1 = {
  id: 1,
  company: "Company 1",
  company_logo: "logo999.png",
  tokens: 100,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 1,
};

const project_1 = {
  id: 1,
  display_name: "Project 999",
  customer_id: 1,
};
const customer_2 = {
  id: 2,
  company: "Company 2",
  company_logo: "logo999.png",
  tokens: 100,
};

const user_to_customer_2 = {
  wp_user_id: 2,
  customer_id: 2,
};

const project_2 = {
  id: 2,
  display_name: "Project 2",
  customer_id: 2,
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
  project_id: 1,
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
  project_id: 2,
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

describe("PATCH /campaigns/{cid}/bugs/{bid}", () => {
  beforeAll(async () => {
    await dbAdapter.add({
      campaignTypes: [campaign_type_1],
      campaigns: [campaign_1],
      companies: [customer_1],
      projects: [project_1],
      userToCustomers: [user_to_customer_1],
    });
    await bugType.addDefaultItems();
    await bugs.insert(bug_1);
    await severities.addDefaultItems();
    await replicabilities.addDefaultItems();
    await statuses.addDefaultItems();
    await devices.insert(device_1);
    await usecases.insert(usecase_1);
  });

  // It should answer 403 if user is not logged in
  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).patch(
      `/campaigns/${campaign_1.id}/bugs/${bug_1.id}`
    );

    expect(response.status).toBe(403);
  });

  // It should fail if the campaign does not exist
  it("Should fail if the campaign does not exist", async () => {
    const response = await request(app)
      .patch(`/campaigns/999/bugs/666`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(400);
  });

  // It should fail if the bug does not exist
  it("Should fail if the bug does not exist", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}/bugs/666`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(400);
  });

  // --- End of file
});
