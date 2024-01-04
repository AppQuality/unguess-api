import replicabilities from "@src/__mocks__/database/bug_replicability";
import severities from "@src/__mocks__/database/bug_severity";
import statuses from "@src/__mocks__/database/bug_status";
import bugType from "@src/__mocks__/database/bug_type";
import { DeviceParams } from "@src/__mocks__/database/device";
import { UseCaseParams } from "@src/__mocks__/database/use_cases";
import app from "@src/app";
import { tryber, unguess } from "@src/features/database";
import { useBasicProjectsContext } from "@src/features/db/hooks/basicProjects";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";
import request from "supertest";
import sgMail from "@sendgrid/mail";

// Mocking sendgrid
jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn(),
  sendMultiple: jest.fn(),
}));

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
  pm_id: 1,
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

const bug_4_pending = {
  ...bug_3,
  id: 4,
  status_id: 3,
};

// Get Mocked Function
const mockedSendgrid = jest.mocked(sgMail, true);

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

    await tryber.tables.WpAppqEvdBug.do().insert([
      bug_1,
      bug_2,
      bug_3,
      bug_4_pending,
    ]);

    await unguess.tables.UgBugsComments.do().insert({
      text: "Comment 1",
      is_deleted: 0,
      bug_id: bug_1.id,
      profile_id: context.profile2.id,
      creation_date_utc: "2023-12-11 09:23:00",
    });
    await tryber.tables.WpAppqUnlayerMailTemplate.do().insert({
      id: 1,
      html_body:
        "Test mail it {Bug.id},{Bug.title},{Bug.url},{Author.name},{Comment}, {Campaign.title}",
      name: "Test mail",
      json_body: "",
      last_editor_tester_id: 1,
      lang: "it",
      category_id: 1,
    });

    await tryber.tables.WpAppqEventTransactionalMail.do().insert({
      id: 1,
      event_name: "notify_campaign_bug_comment",
      template_id: 1,
      last_editor_tester_id: 1,
    });
  });

  afterAll(async () => {
    await bugType.clear();
    await severities.clear();
    await replicabilities.clear();
    await statuses.clear();
    await tryber.tables.WpAppqEventTransactionalMail.do().delete();
    await tryber.tables.WpAppqUnlayerMailTemplate.do().delete();
  });

  // Clear mocks call counter
  beforeEach(() => {
    jest.clearAllMocks();
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

  it("Should fail if the bug is not in a accepted status", async () => {
    const response = await request(app)
      .post(`/campaigns/${campaign_1.id}/bugs/${bug_4_pending.id}/comments`)
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

  // Should fail if the body is not provided
  it("Should fail if the body is not provided", async () => {
    const response = await request(app)
      .post(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}/comments`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(400);
  });

  it("Should fail if there is no comment", async () => {
    const response = await request(app)
      .post(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}/comments`)
      .set("Authorization", "Bearer user")
      .send({ text: "" });

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
          name: `${context.profile1.name} ${context.profile1.surname.charAt(
            0
          )}.`,
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

  it("Should answer 200 with the comment if the user is an admin", async () => {
    const response = await request(app)
      .post(`/campaigns/${campaign_2.id}/bugs/${bug_2.id}/comments`)
      .set("Authorization", "Bearer admin")
      .send({ text: "comment text" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        text: "comment text",
        creator: {
          id: 0,
          name: "Name S.",
        },
      })
    );
  });
  it("Should send an email when the comment is created successfully", async () => {
    const response = await request(app)
      .post(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}/comments`)
      .set("Authorization", "Bearer user")
      .send({ text: "Test comment" });

    expect(response.status).toBe(200);
    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledTimes(1);
    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledWith(
      expect.objectContaining({
        from: {
          email: "info@unguess.io",
          name: "UNGUESS",
        },
        subject: "Nuovo commento sul bug",
        categories: [`CP${campaign_1.id}_BUG_COMMENT_NOTIFICATION`],
        html: expect.stringContaining(
          `Test mail it ${bug_1.id},${bug_1.message},${
            process.env.APP_URL
          }/campaigns/${campaign_1.id}/bugs/${bug_1.id},${
            context.profile1.name
          } ${context.profile1.surname
            .charAt(0)
            .toUpperCase()}.,Test comment, ${campaign_1.customer_title}`
        ),
      })
    );
  });

  it("Should send an email only to other commenters", async () => {
    await unguess.tables.UgBugsComments.do().insert({
      text: "Comment 1",
      is_deleted: 0,
      bug_id: bug_1.id,
      profile_id: context.profile3.id,
      creation_date_utc: "2023-12-11 09:23:00",
    });

    const response = await request(app)
      .post(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}/comments`)
      .set("Authorization", "Bearer user")
      .send({ text: "Test comment" });

    expect(response.status).toBe(200);
    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledTimes(1);
    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledWith(
      expect.objectContaining({
        to: expect.arrayContaining([context.profile2.email]),
      })
    );
  });

  it("Should send an email with a preview of comment if the length is > 80", async () => {
    const response = await request(app)
      .post(`/campaigns/${campaign_1.id}/bugs/${bug_1.id}/comments`)
      .set("Authorization", "Bearer user")
      .send({
        text: "Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live",
      });

    expect(response.status).toBe(200);
    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledTimes(1);
    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledWith(
      expect.objectContaining({
        html: expect.stringContaining(
          `Test mail it ${bug_1.id},${bug_1.message},${
            process.env.APP_URL
          }/campaigns/${campaign_1.id}/bugs/${bug_1.id},${
            context.profile1.name
          } ${context.profile1.surname
            .charAt(0)
            .toUpperCase()}.,Always code as if the guy who ends up maintaining your code will be a violent ps..., ${
            campaign_1.customer_title
          }`
        ),
      })
    );
  });

  it("Should NOT send an email if it's the first comment", async () => {
    const response = await request(app)
      .post(`/campaigns/${campaign_1.id}/bugs/${bug_3.id}/comments`)
      .set("Authorization", "Bearer user")
      .send({ text: "Test comment" });

    expect(response.status).toBe(200);
    expect(mockedSendgrid.sendMultiple).toHaveBeenCalledTimes(0);
  });
});
