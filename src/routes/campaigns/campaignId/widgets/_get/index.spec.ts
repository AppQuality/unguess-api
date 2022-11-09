import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { table as platformTable } from "@src/__mocks__/database/platforms";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";
import userTaskMedia from "@src/__mocks__/database/user_task_media";
import useCases, { UseCaseParams } from "@src/__mocks__/database/use_cases";
import reports from "@src/__mocks__/database/report";
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

const tablet: DeviceParams = {
  id: 123,
  manufacturer: "Apple",
  model: "iPad 9.7 (2018)",
  platform_id: 11,
  id_profile: 62735,
  os_version: "iOS 15.6.1 (15.6.1)",
  operating_system: "iOS",
  form_factor: "Tablet",
};

const desktop: DeviceParams = {
  id: 1234,
  platform_id: 8,
  id_profile: 47337,
  os_version: "Windows 11",
  operating_system: "Windows",
  form_factor: "PC",
  pc_type: "Notebook",
};

const useCase1: UseCaseParams = {
  id: 123,
  title: "Use Case 1: Titolone (Web)",
  content: "Use Case 1 description",
  campaign_id: campaign_1.id,
  simple_title: "Titolone",
  prefix: "Use Case 1:",
  info: "Web",
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
  application_section: useCase1.title,
  application_section_id: useCase1.id,
  note: "Bug 1 note",
  wp_user_id: 1,
  dev_id: device_1.id,
  manufacturer: device_1.manufacturer,
  model: device_1.model,
  os: device_1.operating_system,
  os_version: device_1.os_version,
  severity_id: 1,
  is_duplicated: 0,
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
  status_id: 4,
  status_reason: "Bug 2 status reason",
  application_section: useCase1.title,
  application_section_id: useCase1.id,
  note: "Bug 2 note",
  wp_user_id: 1,
  is_favorite: 1,
  dev_id: device_1.id,
  manufacturer: device_1.manufacturer,
  model: device_1.model,
  os: device_1.operating_system,
  os_version: device_1.os_version,
  severity_id: 2,
  is_duplicated: 0,
};

const bug_media_1 = {
  id: 123,
  bug_id: bug_1.id,
  location: "https://example.com/bug_media_1.png",
  type: "image",
  uploaded: "2021-10-19 12:57:57.0",
};

describe("GET /campaigns/{cid}/widgets", () => {
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
          campaigns: [campaign_1, campaign_2],
        });

        await bugs.mock();
        await bugMedia.mock();
        await bugSeverity.mock();
        await bugReplicability.mock();
        await bugType.mock();
        await bugStatus.mock();
        await devices.mock();
        await useCases.mock();
        await userTaskMedia.mock();
        await reports.mock();
        await useCases.insert(useCase1);
        await bugs.insert(bug_1);
        await bugs.insert(bug_2);
        await bugMedia.insert(bug_media_1);
        await bugSeverity.addDefaultItems();
        await bugReplicability.addDefaultItems();
        await bugType.addDefaultItems();
        await bugStatus.addDefaultItems();
        await devices.insert(device_1);
        await devices.insert(tablet);
        await devices.insert(desktop);
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
        await useCases.dropMock();
        await userTaskMedia.dropMock();
        await reports.dropMock();
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  // It should answer 403 if user is not logged in
  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).get(
      `/campaigns/${campaign_1.id}/widgets`
    );
    expect(response.status).toBe(403);
  });

  // It should answer 400 if campaign does not exist
  it("Should answer 400 if campaign does not exist", async () => {
    const response = await request(app)
      .get(`/campaigns/999999/widgets`)
      .set("Authorization", "Bearer customer");
    expect(response.status).toBe(400);
  });

  // It should answer 403 if the user has no permissions to see the campaign
  it("Should answer 403 if the user has no permissions to see the campaign", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_2.id}/widgets?s=bugs-by-device`)
      .set("Authorization", "Bearer customer");
    expect(response.status).toBe(403);
  });

  // It should answer 400 if the widget does not exist or has an invalid name
  it("Should answer 400 if the widget does not exist or has an invalid name", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/widgets?s=invalid`)
      .set("Authorization", "Bearer customer");
    expect(response.status).toBe(400);
  });

  // It should answer 200 and return the bugs by device widget
  it("Should answer 200 and return the bugs by use case widget", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/widgets?s=bugs-by-usecase`)
      .set("Authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body.kind).toEqual("bugsByUseCase");

    expect(response.body.data[0].title).toEqual(useCase1.simple_title);
    expect(response.body.data[0].bugs).toEqual(2);
  });

  it("Should answer 200 and the usecase title must be used in absence of simple title", async () => {
    const useCase2 = {
      ...useCase1,
      id: 124,
      title: "Use case 2: another usecase",
      campaign_id: campaign_1.id,
      simple_title: "",
      prefix: "",
      info: "",
    };

    const bug_3 = {
      ...bug_1,
      id: 3,
      application_section: useCase2.title,
      application_section_id: useCase2.id,
    };

    await useCases.insert(useCase2);
    await bugs.insert(bug_3);

    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/widgets?s=bugs-by-usecase`)
      .set("Authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body.kind).toEqual("bugsByUseCase");

    expect(response.body.data[1].title).toEqual(useCase2.title);
    expect(response.body.data[1].bugs).toEqual(1);
  });

  it("Should answer 200 and return the bugs by device widget", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/widgets?s=bugs-by-device`)
      .set("Authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body.kind).toEqual("bugsByDevice");
    expect(response.body.data[0].bugs).toEqual(2);

    console.log(response.body.data[0].bugs);
  });

  it("Should answer 200 and return the bugs by device widget (with 2 device type)", async () => {
    //Update bug_2
    await bugs.update(
      [
        {
          dev_id: tablet.id,
          manufacturer: tablet.manufacturer,
          model: tablet.model,
          os: tablet.operating_system,
          os_version: tablet.os_version,
        },
      ],
      [{ id: bug_2.id }]
    );

    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/widgets?s=bugs-by-device`)
      .set("Authorization", "Bearer customer");
    expect(response.status).toBe(200);

    expect(response.body.kind).toEqual("bugsByDevice");
    expect(response.body.data[0].bugs).toEqual(1);
    expect(response.body.data[1].bugs).toEqual(1);
  });

  // --- end of tests ---
});
