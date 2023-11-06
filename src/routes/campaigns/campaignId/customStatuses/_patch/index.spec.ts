import { table } from "./../../../../../__mocks__/database/express";
import status from "@src/__mocks__/database/bug_status";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import custom_statuses, {
  CustomStatusParams,
} from "@src/__mocks__/database/custom_status";
import app from "@src/app";
import { unguess } from "@src/features/database";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";
import { ca } from "date-fns/locale";
import request from "supertest";

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

const customer_2 = {
  id: 2,
  company: "Company 2",
  company_logo: "logo999.png",
  tokens: 100,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 1,
};

const user_to_customer_2 = {
  wp_user_id: 2,
  customer_id: 2,
};

const project_1 = {
  id: 1,
  display_name: "Project 999",
  customer_id: 1,
};

const project_2 = {
  id: 2,
  display_name: "Project 2",
  customer_id: 2,
};

const status_test_with_campaign_and_default_1 = {
  id: 9,
  name: "Default_1",
  color: "ffffff",
  phase_id: 1,
  campaign_id: 1,
  is_default: 1,
};

const status_with_long_name = {
  id: 20,
  name: "Status with name longer than 15 chars",
  phase_id: 1,
  color: "ffffff",
  is_default: 0,
};
const status_with_short_name = {
  id: 13,
  name: "",
  phase_id: 1,
  color: "ffffff",
  is_default: 0,
};

const status_without_campaign = {
  id: 14,
  name: "No camp",
  color: "ffffff",
};

const status_test_with_campaign = {
  id: 10,
  name: "status with campaign",
  campaign_id: 1,
  color: "ffffff",
};

const status_without_phase = {
  id: 15,
  name: "No Phase",
  campaign_id: 1,
  color: "ffffff",
  is_default: 0,
};
const status_test_with_campaign_and_default_3 = {
  id: 11,
  name: "Default status with campaign and default 0",
  phase_id: 1,
  is_default: 0,
};

const status_test_with_campaign_and_default_4 = {
  id: 12,
  name: "CustomUser",
  campaign_id: 2,
  color: "ffffff",
  phase_id: 1,
  is_default: 0,
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

const user_to_project_1 = {
  wp_user_id: 1,
  project_id: 1,
};

const user_to_project_2 = {
  wp_user_id: 2,
  project_id: 2,
};

describe("PATCH /campaigns/{cid}/custom_statuses", () => {
  beforeAll(async () => {
    await dbAdapter.add({
      campaignTypes: [campaign_type_1],
      campaigns: [campaign_1, campaign_2],
      companies: [customer_1, customer_2],
      projects: [project_1, project_2],
      userToCustomers: [user_to_customer_1, user_to_customer_2],
      userToProjects: [user_to_project_1, user_to_project_2],
    });

    await unguess.tables.WpUgBugCustomStatusPhase.do().insert({
      id: 1,
      name: "working",
    });
    await unguess.tables.WpUgBugCustomStatusPhase.do().insert({
      id: 2,
      name: "completed",
    });

    await custom_statuses.addDefaultItems();
    await custom_statuses.insert(status_test_with_campaign_and_default_1);
    await custom_statuses.insert(status_test_with_campaign);
    await custom_statuses.insert(status_test_with_campaign_and_default_3);
    await custom_statuses.insert(status_test_with_campaign_and_default_4);
    await custom_statuses.insert(status_without_phase);
  });

  afterAll(async () => {
    await dbAdapter.clear();
    await unguess.tables.WpUgBugCustomStatusPhase.do().delete();
    await custom_statuses.clear();
  });

  // It should answer 403 if user is not logged in
  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).patch(
      `/campaigns/${campaign_1.id}/custom_statuses`
    );

    expect(response.status).toBe(403);
  });

  // It should fail if the campaign does not exist
  it("Should fail if the campaign does not exist", async () => {
    const response = await request(app)
      .patch(`/campaigns/999/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send({ campaign_id: 995419, name: "test", color: "#000000" });
    expect(response.status).toBe(400);
  });

  // It should fail if the user is NOT the owner
  it("Should fail if the user is not the owner", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_2.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([{ id: 10, name: "status with cam", color: "ffffff" }]);
    expect(response.status).toBe(403);
  });

  it("Should not return a custom status without phase_id ", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([{ id: 10, name: "Update-campaign", color: "0000" }]);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.not.objectContaining({ id: status_without_phase.id }),
      ])
    );
  });

  // Should return only the custom_statuses for the campaign in addition to the default ones
  it("Should return only the custom_statuses for the campaign in addition to the default ones", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([{ name: "New-CS", color: "0000" }]);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "New-CS",
        }),
      ])
    );
    expect(response.body).toEqual([
      {
        id: 1,
        name: "to do",
        phase: { id: 1, name: "working" },
        color: "ffffff",
        is_default: 1,
      },
      {
        id: 2,
        name: "pending",
        phase: { id: 1, name: "working" },
        color: "ffffff",
        is_default: 1,
      },
      {
        id: 3,
        name: "to be imported",
        phase: { id: 1, name: "working" },
        color: "ffffff",
        is_default: 1,
      },
      {
        id: 4,
        name: "open",
        phase: { id: 1, name: "working" },
        color: "ffffff",
        is_default: 1,
      },
      {
        id: 5,
        name: "to be retested",
        phase: { id: 1, name: "working" },
        color: "ffffff",
        is_default: 1,
      },
      {
        id: 8,
        name: "under IT analysis",
        phase: { id: 1, name: "working" },
        color: "ffffff",
        is_default: 1,
      },
      {
        id: 15,
        name: "No Phase",
        phase: { id: 1, name: "working" },
        color: "ffffff",
        is_default: 0,
      },
      {
        id: 16,
        name: "New-CS",
        phase: { id: 1, name: "working" },
        color: "0000",
        is_default: 0,
      },
      {
        id: 6,
        name: "solved",
        phase: { id: 2, name: "completed" },
        color: "ffffff",
        is_default: 1,
      },
      {
        id: 7,
        name: "not a bug",
        phase: { id: 2, name: "completed" },
        color: "ffffff",
        is_default: 1,
      },
    ]);
  });

  // It should not return the list of statuses for a campaign where the user is not an owner
  it("Should not return the list of custom_statuses for a campaign where the user is not an owner", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_2.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        {
          id: 12,
          name: "CustomTest",
          campaign_id: 2,
          color: "000000",
        },
      ]);
    expect(response.body).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          campaign_id: 2 || null,
        }),
      ])
    );
  });

  it("Should not be possible to create a custom status without a name", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_2.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([status_with_short_name]);
    expect(response.status).toBe(403);
  });

  // It should not be possible to create a custom status with a name  > 17chars
  it("Should not be possible to create a custom status with a name  > 17chars", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_2.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([status_with_long_name]);
    expect(response.status).toBe(403);
  });

  it("Should return the correct amount of custom statuses", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        { custom_status_id: 15, name: "testami", color: "000000" },
        { name: "export", color: "ffffff" },
        { name: "import", color: "ffffff" },
      ]);
    expect(response.body.length).toBe(11);
  });
});
