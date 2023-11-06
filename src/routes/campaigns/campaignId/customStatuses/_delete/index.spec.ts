import app from "@src/app";
import request from "supertest";
import { unguess } from "@src/features/database";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import custom_statuses, {
  CustomStatusParams,
} from "@src/__mocks__/database/custom_status";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";
import bugs, { BugsParams } from "@src/__mocks__/database/bugs";
import { ProjectParams } from "@src/__mocks__/database/project";
import { UserToCustomerParams } from "@src/__mocks__/database/user_to_customer";
import { CustomerParams } from "@src/__mocks__/database/customer";
import { UserToProjectParams } from "@src/__mocks__/database/user_to_project";
import bug_custom_statuses, {
  BugCustomStatusParams,
} from "@src/__mocks__/database/bug_custom_status";

const campaign_type_1 = {
  id: 1,
  name: "Functional Testing (Bug Hunting)",
  type: FUNCTIONAL_CAMPAIGN_TYPE_ID,
};

const customer_1: CustomerParams = {
  id: 1,
  company: "Company 1",
  company_logo: "logo1.png",
  tokens: 100,
};

const user_to_customer_1: UserToCustomerParams = {
  wp_user_id: 1,
  customer_id: customer_1.id,
};

const project_1: ProjectParams = {
  id: 1,
  display_name: "Project 1",
  customer_id: customer_1.id,
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
  project_id: project_1.id,
};

const user_to_project_1: UserToProjectParams = {
  wp_user_id: 1,
  project_id: project_1.id,
};

const custom_status_1: CustomStatusParams & { campaign_id: number } = {
  id: 9,
  name: "Custom status 1",
  phase_id: 1,
  campaign_id: campaign_1.id,
  is_default: 0,
};

const customer_2: CustomerParams = {
  id: 2,
  company: "Company 2",
  company_logo: "logo2.png",
  tokens: 100,
};

const user_to_customer_2: UserToCustomerParams = {
  wp_user_id: 2,
  customer_id: customer_2.id,
};

const project_2: ProjectParams = {
  id: 2,
  display_name: "Project 2",
  customer_id: customer_2.id,
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
  project_id: project_2.id,
};

const custom_status_2: CustomStatusParams & { campaign_id: number } = {
  id: 10,
  name: "Custom status 2",
  phase_id: 1,
  campaign_id: campaign_2.id,
  is_default: 0,
};

const custom_status_3: CustomStatusParams & { campaign_id: number } = {
  id: 11,
  name: "Custom status 3",
  phase_id: 1,
  campaign_id: campaign_1.id,
  is_default: 0,
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
  dev_id: 12,
  is_duplicated: 1,
  duplicated_of_id: 2,
  manufacturer: "Apple",
  model: "iPhone 13",
  os: "iOS",
  os_version: "iOS 16 (16)",
  severity_id: 1,
};

const bug_2: BugsParams = {
  ...bug_1,
  id: 2,
};
const bug_3: BugsParams = {
  ...bug_1,
  id: 3,
};

const bug_custom_status_1: BugCustomStatusParams = {
  custom_status_id: custom_status_1.id,
  bug_id: bug_1.id,
};

const bug_custom_status_2: BugCustomStatusParams = {
  custom_status_id: custom_status_3.id,
  bug_id: bug_2.id,
};

const custom_status_4: CustomStatusParams & { campaign_id: number } = {
  id: 12,
  name: "Custom status 4",
  phase_id: 1,
  campaign_id: campaign_1.id,
  is_default: 0,
};

describe("DELETE /campaigns/{cid}/custom_statuses", () => {
  beforeEach(async () => {
    await dbAdapter.add({
      campaignTypes: [campaign_type_1],
      campaigns: [campaign_1, campaign_2],
      companies: [customer_1],
      projects: [project_1, project_2],
      userToCustomers: [user_to_customer_1, user_to_customer_2],
      userToProjects: [user_to_project_1],
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
    await custom_statuses.insert(custom_status_1);
    await custom_statuses.insert(custom_status_2);
    await custom_statuses.insert(custom_status_3);
    await custom_statuses.insert(custom_status_4);

    await bugs.insert(bug_1);
    await bugs.insert(bug_2);
    await bugs.insert(bug_3);

    await bug_custom_statuses.insert(bug_custom_status_1);
    await bug_custom_statuses.insert(bug_custom_status_2);
  });

  afterEach(async () => {
    await dbAdapter.clear();
    await unguess.tables.WpUgBugCustomStatusPhase.do().delete();
    await custom_statuses.clear();
    await bugs.clear();
  });

  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).delete(
      `/campaigns/${campaign_1.id}/custom_statuses`
    );

    expect(response.status).toBe(403);
  });

  it("Should fail if the campaign does not exist", async () => {
    const response = await request(app)
      .delete(`/campaigns/999/custom_statuses`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(400);
  });

  it("Should fail if the user is not the owner", async () => {
    const response = await request(app)
      .delete(`/campaigns/${campaign_2.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        {
          custom_status_id: custom_status_2.id,
        },
      ]);

    expect(response.status).toBe(403);
  });

  it("Should fail if the custom status does not exist", async () => {
    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        {
          custom_status_id: 999,
        },
      ]);

    expect(response.status).toBe(400);
  });

  it("Should fail if the custom status is default", async () => {
    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        {
          custom_status_id: 1,
        },
      ]);

    expect(response.status).toBe(400);
  });

  it("Should fail if the custom status is not from the campaign", async () => {
    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        {
          custom_status_id: custom_status_2.id,
        },
      ]);

    expect(response.status).toBe(400);
  });

  it("Should return 200", async () => {
    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        {
          custom_status_id: custom_status_3.id,
        },
      ]);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);
  });

  it("Should delete the custom status", async () => {
    const customStatusBefore = await unguess.tables.WpUgBugCustomStatus.do()
      .select()
      .where({ id: custom_status_3.id })
      .first();
    expect(customStatusBefore).toBeDefined();

    const bugCustomStatusBefore =
      await unguess.tables.WpUgBugCustomStatusToBug.do()
        .select()
        .where({ custom_status_id: custom_status_3.id })
        .first();
    expect(bugCustomStatusBefore).toBeDefined();

    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        {
          custom_status_id: custom_status_3.id,
        },
      ]);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);

    const customStatusAfter = await unguess.tables.WpUgBugCustomStatus.do()
      .select()
      .where({ id: custom_status_3.id })
      .first();
    expect(customStatusAfter).toBeUndefined();

    const bugCustomStatusAfter =
      await unguess.tables.WpUgBugCustomStatusToBug.do()
        .select()
        .where({ custom_status_id: custom_status_3.id })
        .first();
    expect(bugCustomStatusAfter).toBeUndefined();
  });

  it("Should delete all multiple custom statuses", async () => {
    const customStatusBefore = await unguess.tables.WpUgBugCustomStatus.do()
      .select()
      .whereIn("id", [9, 11]);
    expect(customStatusBefore).toHaveLength(2);

    const bugCustomStatusBefore =
      await unguess.tables.WpUgBugCustomStatusToBug.do()
        .select()
        .whereIn("custom_status_id", [9, 11]);
    expect(bugCustomStatusBefore).toHaveLength(2);

    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        {
          custom_status_id: custom_status_1.id, //9
        },
        {
          custom_status_id: custom_status_3.id, //11
        },
      ]);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);

    const customStatusAfter = await unguess.tables.WpUgBugCustomStatus.do()
      .select()
      .whereIn("id", [9, 11]);
    expect(customStatusAfter).toHaveLength(0);

    const bugCustomStatusAfter =
      await unguess.tables.WpUgBugCustomStatusToBug.do()
        .select()
        .whereIn("custom_status_id", [9, 11]);
    expect(bugCustomStatusAfter).toHaveLength(0);
  });

  it("Should throw an error 400 if the target custom status does not exist", async () => {
    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        {
          custom_status_id: custom_status_1.id,
          to_custom_status_id: 999,
        },
      ]);

    expect(response.status).toBe(400);
  });

  it("Should throw an error 400 if the target custom status is not from the campaign", async () => {
    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        {
          custom_status_id: custom_status_1.id,
          to_custom_status_id: custom_status_2.id,
        },
      ]);
    expect(response.status).toBe(400);
  });

  it("Should migrate the campaign bugs to the target custom status if specified", async () => {
    const customStatusBefore = await unguess.tables.WpUgBugCustomStatus.do()
      .select()
      .where({ id: custom_status_3.id })
      .first();
    expect(customStatusBefore).toBeDefined();

    const bugCustomStatusBefore =
      await unguess.tables.WpUgBugCustomStatusToBug.do()
        .select()
        .where({ custom_status_id: custom_status_3.id });
    expect(bugCustomStatusBefore).toBeDefined();

    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        {
          custom_status_id: custom_status_3.id,
          to_custom_status_id: custom_status_1.id,
        },
      ]);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);

    const customStatusAfter = await unguess.tables.WpUgBugCustomStatus.do()
      .select()
      .where({ id: custom_status_3.id });
    expect(customStatusAfter).toBeDefined();

    const deletedBugCustomStatus =
      await unguess.tables.WpUgBugCustomStatusToBug.do()
        .select()
        .where({ custom_status_id: custom_status_3.id })
        .first();
    expect(deletedBugCustomStatus).toBeUndefined();

    const newBugCustomStatus =
      await unguess.tables.WpUgBugCustomStatusToBug.do()
        .select()
        .where("bug_id", bug_2.id)
        .andWhere("custom_status_id", custom_status_1.id)
        .first();
    expect(newBugCustomStatus).toBeDefined();
  });

  it("Should migrate the campaign bugs to the multiple custom statuses if specified", async () => {
    const customStatusBefore = await unguess.tables.WpUgBugCustomStatus.do()
      .select()
      .where("id", custom_status_1.id)
      .orWhere("id", custom_status_3.id);

    expect(customStatusBefore).toHaveLength(2);

    const bugCustomStatusBefore =
      await unguess.tables.WpUgBugCustomStatusToBug.do()
        .select()
        .where("custom_status_id", custom_status_1.id)
        .orWhere("custom_status_id", custom_status_3.id);

    expect(bugCustomStatusBefore).toHaveLength(2);

    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        {
          custom_status_id: custom_status_1.id,
        },
        {
          custom_status_id: custom_status_3.id,
          to_custom_status_id: custom_status_4.id,
        },
      ]);

    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);

    const customStatusAfter = await unguess.tables.WpUgBugCustomStatus.do()
      .select()
      .where("id", custom_status_1.id)
      .orWhere("id", custom_status_3.id);

    expect(customStatusAfter).toHaveLength(0);

    const bugCustomStatusAfter1 =
      await unguess.tables.WpUgBugCustomStatusToBug.do()
        .select()
        .where("custom_status_id", custom_status_1.id)
        .orWhere("custom_status_id", custom_status_3.id);

    expect(bugCustomStatusAfter1).toHaveLength(0);

    const bugCustomStatusAfter2 =
      await unguess.tables.WpUgBugCustomStatusToBug.do()
        .select()
        .where("custom_status_id", custom_status_4.id);

    expect(bugCustomStatusAfter2).toHaveLength(1);
  });

  it("Should migrate the campaign bugs to the multiple default statuses if specified", async () => {
    const customStatusBefore = await unguess.tables.WpUgBugCustomStatus.do()
      .select()
      .whereIn("id", [9, 11]);
    expect(customStatusBefore).toHaveLength(2);

    const bugCustomStatusBefore =
      await unguess.tables.WpUgBugCustomStatusToBug.do()
        .select()
        .whereIn("custom_status_id", [9, 11]);
    expect(bugCustomStatusBefore).toHaveLength(2);

    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/custom_statuses`)
      .set("Authorization", "Bearer user")
      .send([
        {
          custom_status_id: custom_status_1.id,
          to_custom_status_id: 1,
        },
        {
          custom_status_id: custom_status_3.id,
          to_custom_status_id: 2,
        },
      ]);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe(true);

    const deletedCustomStatus = await unguess.tables.WpUgBugCustomStatus.do()
      .select()
      .whereIn("id", [9, 11]);
    expect(deletedCustomStatus).toHaveLength(0);

    const bugCustomStatusAfter1 =
      await unguess.tables.WpUgBugCustomStatusToBug.do()
        .select()
        .where("custom_status_id", custom_status_1.id)
        .orWhere("custom_status_id", custom_status_3.id);
    expect(bugCustomStatusAfter1).toHaveLength(0);

    const bugCustomStatusAfter2 =
      await unguess.tables.WpUgBugCustomStatusToBug.do()
        .select()
        .whereIn("custom_status_id", [1, 2]);
    expect(bugCustomStatusAfter2).toHaveLength(2);
  });
});
