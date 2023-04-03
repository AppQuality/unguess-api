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
import tags from "@src/__mocks__/database/bug_tags";
import bug_priorities from "@src/__mocks__/database/bug_priority";
import priorities from "@src/__mocks__/database/priority";
import bug_custom_statuses from "@src/__mocks__/database/bug_custom_statuses";
import bug_custom_status from "@src/__mocks__/database/bug_custom_status";

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

const bug_2: BugsParams = {
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
};

const bug_3: BugsParams = {
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
};

const tag_1 = {
  id: 69,
  tag_id: 1,
  display_name: "Tag 1",
  campaign_id: campaign_1.id,
  bug_id: bug_1.id,
};
const tag_2_other_cp = {
  id: 1,
  tag_id: 45,
  display_name: "Tag 2",
  campaign_id: campaign_2.id,
  bug_id: 1000,
};

const tag_3 = {
  id: 3,
  tag_id: 2,
  display_name: "Tag 3",
  campaign_id: campaign_1.id,
  bug_id: bug_3.id,
};

const priority_1 = {
  id: 1,
  name: "lowest",
};

const priority_2 = {
  id: 3,
  name: "medium",
};

const priority_3 = {
  id: 5,
  name: "highest",
};

const bug_priority_1 = {
  bug_id: bug_1.id,
  priority_id: priority_1.id,
};

const bug_priority_2 = {
  bug_id: bug_2.id,
  priority_id: priority_2.id,
};

const bug_priority_3 = {
  bug_id: bug_3.id,
  priority_id: priority_3.id,
};


const status_1 = {
  id: 1,
  name: "to do",
};

const status_2 = {
  id: 2,
  name: "to be imported",
};

const status_3 = {
  id: 3,
  name: "open",
};

const bug_status_1 = {
  bug_id: bug_1.id,
  custom_status_id: status_1.id,
};

const bug_status_2 = {
  bug_id: bug_2.id,
  custom_status_id: status_2.id,
};

const bug_status_3 = {
  bug_id: bug_3.id,
  custom_status_id: status_3.id,
};

describe("PATCH /campaigns/{cid}/bugs/{bid}", () => {
  beforeAll(async () => {
    await dbAdapter.add({
      campaignTypes: [campaign_type_1],
      campaigns: [campaign_1, campaign_2],
      companies: [customer_1, customer_2],
      projects: [project_1, project_2],
      userToCustomers: [user_to_customer_1, user_to_customer_2],
    });
    await bugType.addDefaultItems();
    await bugs.insert(bug_1);
    await bugs.insert(bug_2);
    await bugs.insert(bug_3);
    await severities.addDefaultItems();
    await replicabilities.addDefaultItems();
    await statuses.addDefaultItems();
    await devices.insert(device_1);
    await usecases.insert(usecase_1);
    await tags.insert(tag_1);
    await tags.insert(tag_2_other_cp);
    await tags.insert(tag_3);
    await bug_priorities.insert(bug_priority_1);
    await bug_priorities.insert(bug_priority_2);
    await bug_priorities.insert(bug_priority_3);
    await priorities.addDefaultItems();
    await bug_custom_statuses.insert(bug_status_1);
    await bug_custom_statuses.insert(bug_status_2);
    await bug_custom_statuses.insert(bug_status_3);
    await bug_custom_status.addDefaultItems();
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
  // it Should fail if the user is not the owner
  it("Should fail if the user is not the owner", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_2.id}/bugs/${bug_2.id}`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(403);
  });
  it("Should remove all tags if send empty tags", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user")
      .send({
        tags: [],
      });
    expect(response.status).toBe(200);
    expect(response.body.tags).toEqual([]);
  });
  it("Should add existing tag by tag_id", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user")
      .send({
        tags: [{ tag_id: tag_3.tag_id }],
      });
    expect(response.status).toBe(200);
    expect(response.body.tags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tag_id: tag_3.tag_id,
          tag_name: tag_3.display_name,
        }),
      ])
    );
  });
  it("Should add tag by tag_name if tag does not exists", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user")
      .send({
        tags: [
          { tag_id: tag_3.tag_id },
          { tag_name: "Tag to be add" },
          { tag_name: "Tag to be add 2" },
        ],
      });
    expect(response.status).toBe(200);
    expect(response.body.tags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          tag_id: 47,
          tag_name: "Tag to be add 2",
        }),
        expect.objectContaining({
          //existing tag
          tag_id: tag_3.tag_id,
          tag_name: tag_3.display_name,
        }),
        expect.objectContaining({
          tag_id: 46,
          tag_name: "Tag to be add",
        }),
      ])
    );
  });
  it("Should ignore duplicated tag_id", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user")
      .send({
        tags: [
          { tag_id: tag_3.tag_id },
          { tag_name: "Tag to be add" },
          { tag_id: tag_3.tag_id },
        ],
      });
    expect(response.status).toBe(200);
    expect(response.body.tags.length).toEqual(2);
    expect(response.body.tags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          //existing tag
          tag_id: tag_3.tag_id,
          tag_name: tag_3.display_name,
        }),
      ])
    );
    expect(
      response.body.tags[0].tag_id !== response.body.tags[1].tag_id
    ).toEqual(true);
  });

  // Should return an error 403 if the priority does not exists
  it("It should return an error 403 if the priority does not exists", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user")
      .send({ priority_id: 999 });

    expect(response.status).toBe(403);
  });

  // Should return an error 400 if the priority is not a number
  it("It should return an error 400 if the priority is not a number", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user")
      .send({ priority_id: "not a number" });

    expect(response.status).toBe(400);
  });

  // It should return the updated priority
  it("It should return the updated priority", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user")
      .send({ priority_id: bug_priority_1.priority_id });

    expect(response.status).toBe(200);
    expect(response.body.priority).toEqual(expect.objectContaining(priority_1));
  });

  // It should not return the priority if not sent
  it("It should not return the priority if not sent", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user")
      .send({
        tags: [
          { tag_id: tag_3.tag_id },
          { tag_name: "Tag to be add" },
          { tag_id: tag_3.tag_id },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body.priority).toBeUndefined();
  });

  // It should keep existing tags if no tags field in body while patching priority
  it("It should keep existing tags if no tags field in body while patching priority", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user")
      .send({ priority_id: bug_priority_1.priority_id });

    expect(response.status).toBe(200);
    expect(response.body.tags[0]).toEqual({
      tag_id: tag_3.tag_id,
      tag_name: tag_3.display_name
    })
  });

  it("It should return an error 403 if the status does not exists", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user")
      .send({ custom_status_id: 99 });

    expect(response.status).toBe(403);
  });

  // Should return an error 400 if the status is not a number
  it("It should return an error 400 if the status is not a number", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user")
      .send({ custom_status_id: "not a number" });

    expect(response.status).toBe(400);
  });

  // It should return the updated status
  it("It should return the updated status", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user")
      .send({ custom_status_id: bug_status_1.custom_status_id });

    expect(response.status).toBe(200);
    expect(response.body.customStatus).toEqual(expect.objectContaining(status_1));
  });

  // It should not return the status if not sent
  it("It should not return the status if not sent", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user")
      .send({
        priority_id: priority_3.id,
        tags: [
          { tag_id: tag_3.tag_id },
          { tag_name: "Tag to be add" },
          { tag_id: tag_3.tag_id },
        ],
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBeUndefined();
  });

  // It should keep existing entries if no update field in body while patching status
  it("It should keep existing entries if no update field in body while patching status", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}`)
      .set("Authorization", "Bearer user")
      .send({
        custom_status_id: bug_status_1.custom_status_id
      });

    expect(response.status).toBe(200);
    expect(response.body.tags[0]).toEqual({
      tag_id: tag_3.tag_id,
      tag_name: tag_3.display_name
    })
  });

  // --- End of file
});
