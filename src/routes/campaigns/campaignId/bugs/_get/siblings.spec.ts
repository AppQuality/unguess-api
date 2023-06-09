import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";
import bugs, { BugsParams } from "@src/__mocks__/database/bugs";
import bugSeverity from "@src/__mocks__/database/bug_severity";
import bugReplicability from "@src/__mocks__/database/bug_replicability";
import bugType from "@src/__mocks__/database/bug_type";
import bugStatus from "@src/__mocks__/database/bug_status";

const customer_1 = {
  id: 999,
  company: "Company 999",
  company_logo: "logo999.png",
  tokens: 100,
};

const customer_10 = {
  id: 10,
  company: "Company 10",
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
  base_bug_internal_id: "BUG01",
};

const campaign_4 = {
  id: 4,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 4 title",
  customer_title: "Campaign 4 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: project_1.id,
  cust_bug_vis: 1,
};
const campaign_5 = {
  id: 5,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 5 title - no title rule",
  customer_title: "Campaign 5 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: project_1.id,
};

const bug: BugsParams = {
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
  severity_id: 1,
};

const bug_1: BugsParams = {
  ...bug,
  id: 1,
  is_duplicated: 1,
  duplicated_of_id: 2,
};

const bug_2: BugsParams = {
  ...bug,
  id: 2,
  is_duplicated: 0,
};

const bug_3: BugsParams = {
  ...bug,
  id: 3,
  is_duplicated: 0,
};

const bug_4: BugsParams = {
  ...bug,
  id: 4,
  is_duplicated: 1,
  duplicated_of_id: 3,
};

const bug_5: BugsParams = {
  ...bug,
  id: 5,
  is_duplicated: 1,
  duplicated_of_id: 3,
};

const bug_9_no_tags: BugsParams = {
  ...bug,
  id: 9,
  is_duplicated: 0,
};

describe("GET /campaigns/{cid}/bugs", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.add({
          companies: [customer_1, customer_10],
          userToCustomers: [user_to_customer_1],
          projects: [project_1, project_2],
          userToProjects: [user_to_project_1],
          campaignTypes: [campaign_type_1],
          campaigns: [campaign_1, campaign_4, campaign_5],
        });

        await bugs.insert(bug_1);
        await bugs.insert(bug_2);
        await bugs.insert(bug_3);
        await bugs.insert(bug_4);
        await bugs.insert(bug_5);
        await bugs.insert(bug_9_no_tags);
        await bugSeverity.addDefaultItems();
        await bugReplicability.addDefaultItems();
        await bugType.addDefaultItems();
        await bugStatus.addDefaultItems();
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  it("Should return the number of siblings", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/bugs`)
      .set("Authorization", "Bearer user");
    expect(response.body).toHaveProperty("items");
    expect(response.body.items.length).toBe(6);
    expect(
      response.body.items.find((bug: { id: number }) => bug.id === bug_1.id),
      "Bug 1 should have 1 sibling"
    ).toHaveProperty("siblings", 1);
    expect(
      response.body.items.find((bug: { id: number }) => bug.id === bug_2.id),
      "Bug 2 should have 1 sibling"
    ).toHaveProperty("siblings", 1);

    expect(
      response.body.items.find((bug: { id: number }) => bug.id === bug_3.id),
      "Bug 3 should have 2 sibling"
    ).toHaveProperty("siblings", 2);

    expect(
      response.body.items.find((bug: { id: number }) => bug.id === bug_4.id),
      "Bug 4 should have 2 sibling"
    ).toHaveProperty("siblings", 2);

    expect(
      response.body.items.find((bug: { id: number }) => bug.id === bug_5.id),
      "Bug 5 should have 2 sibling"
    ).toHaveProperty("siblings", 2);

    expect(
      response.body.items.find(
        (bug: { id: number }) => bug.id === bug_9_no_tags.id
      ),
      "Bug 9 should have 0 sibling"
    ).toHaveProperty("siblings", 0);
  });

  // --- End of file
});
