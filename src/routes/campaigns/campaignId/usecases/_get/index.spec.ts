import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import useCases from "@src/__mocks__/database/use_cases";
import bugs from "@src/__mocks__/database/bugs";
import candidates from "@src/__mocks__/database/cp_has_candidate";
import useCaseGroup from "@src/__mocks__/database/use_case_group";
import bugStatus from "@src/__mocks__/database/bug_status";

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
  campaign_id: 1,
  info: "usecase 1 info",
  prefix: "usecase 1 prefix",
  position: 10,
};
const usecase_2 = {
  id: 2,
  title: "Usecase 2 no bugs",
  campaign_id: 1,
  info: "usecase 2 info",
  prefix: "usecase 2 prefix",
};
const usecase_3 = {
  id: 3,
  title: "Usecase 3 other cp",
  campaign_id: 2,
  info: "usecase 3 info",
  prefix: "usecase 3 prefix",
};
const usecase_4 = {
  id: 4,
  title: "Usecase 4 no acceptable bugs",
  campaign_id: 1,
  info: "usecase 3 info",
  prefix: "usecase 3 prefix",
};

const usecase_5 = {
  id: 5,
  title: "Usecase 5 first position",
  campaign_id: 1,
  info: "usecase 5 info",
  prefix: "usecase 5 prefix",
  position: 1,
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
const bug_4 = {
  id: 4,
  wp_user_id: 2,
  message: "Bug 4 not approved",
  description: "Bug 4 description",
  application_section_id: usecase_5.id,
  severity_id: 1,
  status_id: 2,
  campaign_id: 1,
};

describe("GET /campaigns/{cid}/usecases", () => {
  beforeAll(async () => {
    await dbAdapter.addCampaignWithProject({
      campaign_id: 1,
      project_id: 1,
      customer_id: 1,
      wp_user_id: 1,
      campaign: { cust_bug_vis: 1 },
    });
    await dbAdapter.addCampaignWithProject({
      campaign_id: 2,
      project_id: 2,
      customer_id: 2,
      wp_user_id: 2,
      campaign: { cust_bug_vis: 1 },
    });
    await candidates.insert(candidates_1);
    await useCaseGroup.insert(usecase_group_1);
    await useCases.insert(usecase_1);
    await useCases.insert(usecase_2);
    await useCases.insert(usecase_3);
    await useCases.insert(usecase_4);
    await useCases.insert(usecase_5);
    await bugStatus.addDefaultItems();
    await bugs.insert(bug_1);
    await bugs.insert(bug_2);
    await bugs.insert(bug_3);
    await bugs.insert(bug_4);
  });
  afterAll(async () => {
    await dbAdapter.clear();
    await bugStatus.clear();
  });

  // It should answer 403 if user is not logged in
  it("Should answer 403 if user is not logged in", async () => {
    const response = await request(app).get(`/campaigns/1/usecases`);
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
      .get(`/campaigns/1/usecases`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  // it Should fail if the user is not the owner
  it("Should fail if the user is not the owner", async () => {
    const response = await request(app)
      .get(`/campaigns/2/usecases`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  //should return campaign usecases
  it("Should return campaign usecases if usecase has at least one valid bug", async () => {
    const response = await request(app)
      .get(`/campaigns/1/usecases`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        id: 5,
        title: {
          full: usecase_5.title,
          prefix: usecase_5.prefix,
          info: usecase_5.info,
        },
        completion: 12.5,
      },
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
    await dbAdapter.addCampaignWithProject({
      campaign_id: 1,
      project_id: 1,
      customer_id: 1,
      wp_user_id: 1,
      campaign: { cust_bug_vis: 1 },
    });
    await bugStatus.addDefaultItems();
    await bugs.insert(bug_2);
  });
  afterAll(async () => {
    await dbAdapter.clear();
    await bugStatus.clear();
  });

  //should return campaign usecases
  it("Should return not a specific usecase if campaign has not bug in usecases", async () => {
    const response = await request(app)
      .get(`/campaigns/1/usecases`)
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
