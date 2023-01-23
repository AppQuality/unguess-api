import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";
import useCases from "@src/__mocks__/database/use_cases";
import bugs from "@src/__mocks__/database/bugs";
import candidates from "@src/__mocks__/database/cp_has_candidate";
import useCaseGroup from "@src/__mocks__/database/use_case_group";

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
  cust_bug_vis: 1,
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
  cust_bug_vis: 1,
};
const candidates_1 = {
  user_id: 1,
  campaign_id: 1,
  accepted: 1,
  group_id: 1,
};
const usecase_group_1 = {
  task_id: 1,
  group_id: 1,
};

const usecase_1 = {
  id: 1,
  title: "Usecase 1",
  content: "Use Case 1 description",
  campaign_id: campaign_1.id,
  info: "usecase 1 info",
  prefix: "usecase 1 prefix",
};
const usecase_2 = {
  id: 2,
  title: "Usecase 2 no bugs",
  content: "Use Case 2 description",
  campaign_id: campaign_1.id,
  info: "usecase 2 info",
  prefix: "usecase 2 prefix",
};
const usecase_3 = {
  id: 3,
  title: "Usecase 3 other cp",
  content: "Use Case 2 description",
  campaign_id: campaign_2.id,
  info: "usecase 3 info",
  prefix: "usecase 3 prefix",
};
const usecase_4 = {
  id: 4,
  title: "Usecase 4 no acceptable bugs",
  content: "Use Case 4 description",
  campaign_id: campaign_1.id,
  info: "usecase 3 info",
  prefix: "usecase 3 prefix",
};

const bug_1 = {
  id: 1,
  wp_user_id: 1,
  message: "Bug 1",
  description: "Bug 1 description",
  application_section_id: usecase_1.id,
  severity_id: 1,
  status_id: 2,
  campaign_id: 1,
};
const bug_2 = {
  id: 2,
  wp_user_id: 2,
  message: "Bug 2 not a specific use case",
  description: "Bug 2 description",
  application_section_id: -1,
  severity_id: 1,
  status_id: 2,
  campaign_id: 1,
};
const bug_3 = {
  id: 3,
  wp_user_id: 2,
  message: "Bug 3 not approved",
  description: "Bug 3 description",
  application_section_id: 4,
  severity_id: 1,
  status_id: 1,
  campaign_id: 1,
};

describe("GET /campaigns/{cid}/usecases", () => {
  beforeAll(async () => {
    await dbAdapter.add({
      campaignTypes: [campaign_type_1],
      campaigns: [campaign_1, campaign_2],
      companies: [customer_1, customer_2],
      projects: [project_1, project_2],
      userToCustomers: [user_to_customer_1, user_to_customer_2],
    });
    await candidates.insert(candidates_1);
    await useCaseGroup.insert(usecase_group_1);
    await useCases.insert(usecase_1);
    await useCases.insert(usecase_2);
    await useCases.insert(usecase_3);
    await useCases.insert(usecase_4);
    await bugs.insert(bug_1);
    await bugs.insert(bug_2);
    await bugs.insert(bug_3);
  });
  afterAll(async () => {
    await dbAdapter.clear();
  });

  // It should answer 403 if user is not logged in
  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).get(
      `/campaigns/${campaign_1.id}/usecases`
    );
    expect(response.status).toBe(403);
  });

  // It should fail if the campaign does not exist
  it("Should fail if the campaign does not exist", async () => {
    const response = await request(app)
      .get(`/campaigns/999/usecases`)
      .set("Authorization", "Bearer user");

    expect(response.status).toBe(400);
  });

  // it should return 200 if the user is the owner
  it("Should return 200 if the user is the owner", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/usecases`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  // it Should fail if the user is not the owner
  it("Should fail if the user is not the owner", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_2.id}/usecases`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  //should return campaign usecases
  it("Should return campaign usecases if usecase has at least one valid bug", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/usecases`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 1,
        title: {
          full: usecase_1.title,
          prefix: usecase_1.prefix,
          info: usecase_1.info,
        },
        completion: 12.5,
      },
      {
        id: -1,
        title: { full: "Not a specific Usecase" },
        completion: 12.5,
      },
    ]);
  });

  // --- End of file
});

describe("GET /campaigns/{cid}/usecases when campaign has not usecases", () => {
  beforeAll(async () => {
    await dbAdapter.add({
      campaignTypes: [campaign_type_1],
      campaigns: [campaign_1],
      companies: [customer_1],
      projects: [project_1],
      userToCustomers: [user_to_customer_1],
    });
    await bugs.insert(bug_2);
  });

  //should return campaign usecases
  it("Should return not a specific usecase if campaign has not bug in usecases", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/usecases`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: -1,
        title: { full: "Not a specific Usecase" },
        completion: 12.5,
      },
    ]);
  });
});
