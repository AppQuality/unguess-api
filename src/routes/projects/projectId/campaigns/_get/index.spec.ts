import bugs from "@src/__mocks__/database/bugs";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import useCases from "@src/__mocks__/database/use_cases";
import userTaskMedia from "@src/__mocks__/database/user_task_media";
import app from "@src/app";
import { tryber } from "@src/features/database";
import {
  EXPERIENTIAL_CAMPAIGN_TYPE_ID,
  LIMIT_QUERY_PARAM_DEFAULT,
} from "@src/utils/constants";
import request from "supertest";

const customer_profile_1 = {
  id: 1,
  wp_user_id: 1,
  name: "Customer",
  surname: "Customer",
  email: "customer@unguess.io",
};

const customer_1 = {
  id: 1,
  company: "Company 1",
  company_logo: "logo1.png",
  tokens: 100,
};

const customer_2 = {
  id: 2,
  company: "Company 2",
  company_logo: "logo2.png",
  tokens: 200,
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
  display_name: "Projettino unoh",
  customer_id: 1,
};

const project_2 = {
  id: 2,
  display_name: "Projettino dueh",
  customer_id: 2,
};

const project_3 = {
  id: 3,
  display_name: "Projettino treh",
  customer_id: 1,
};

const user_to_project_1 = {
  wp_user_id: 1,
  project_id: 1,
};

const user_to_project_2 = {
  wp_user_id: 2,
  project_id: 2,
};

const user_to_project_3 = {
  wp_user_id: 1,
  project_id: 3,
};

const user_to_project_4 = {
  wp_user_id: 2,
  project_id: 1,
};

const campaign_1 = {
  id: 1,
  start_date: "2017-07-20 00:00:00",
  end_date: "2017-07-20 00:00:00",
  close_date: "2017-07-20 00:00:00",
  title: "Campagnetta Funzionale Provetta 1",
  customer_title: "titolo 1",
  status_id: 1,
  is_public: 0,
  campaign_type_id: 1,
  campaign_type: 0,
  project_id: 1,
};

const campaign_2 = {
  id: 2,
  start_date: "2017-07-22 00:00:00",
  end_date: "2017-07-22 00:00:00",
  close_date: "2017-07-22 00:00:00",
  title: "Campagnetta Funzionale Provetta 2",
  customer_title: "titolo 2",
  status_id: 1,
  is_public: 0,
  campaign_type_id: 1,
  campaign_type: 0,
  project_id: 1,
};

const campaign_3 = {
  id: 3,
  start_date: "2017-07-20 00:00:00",
  end_date: "2017-07-20 00:00:00",
  close_date: "2017-07-20 00:00:00",
  title: "Campagnetta Funzionale Provetta 3",
  customer_title: "titolo 3",
  status_id: 1,
  is_public: 0,
  campaign_type_id: 1,
  campaign_type: 0,
  project_id: 3,
};

const campaign_type_1 = {
  id: 1,
  name: "Functional Bug Finding",
  type: EXPERIENTIAL_CAMPAIGN_TYPE_ID,
};

describe("GET /projects/{pid}/campaigns", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.add({
          campaigns: [campaign_1, campaign_2, campaign_3],
          profiles: [customer_profile_1],
          companies: [customer_1, customer_2],
          projects: [project_1, project_2, project_3],
          userToCustomers: [user_to_customer_1, user_to_customer_2],
          userToProjects: [
            user_to_project_1,
            user_to_project_2,
            user_to_project_3,
            user_to_project_4,
          ],
          campaignTypes: [campaign_type_1],
        });

        //Outputs
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  it("Should answer 200 if logged in", async () => {
    const response = await request(app)
      .get(`/projects/${project_1.id}/campaigns`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).get(
      `/projects/${project_1.id}/campaigns`
    );
    expect(response.status).toBe(403);
  });

  it("Should answer 400 if pid is a string", async () => {
    const response = await request(app)
      .get(`/projects/asd/campaigns`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should return 403 if project is not found", async () => {
    const response = await request(app)
      .get(`/projects/999/campaigns`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  it("Should return a list of campaigns if project is present", async () => {
    const response = await request(app)
      .get(`/projects/${project_1.id}/campaigns`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items.length).toBeGreaterThan(0);
    response.body.items.forEach((project: Object) => {
      expect(project).toHaveProperty("id");
      expect(project).toHaveProperty("start_date");
      expect(project).toHaveProperty("end_date");
      expect(project).toHaveProperty("close_date");
      expect(project).toHaveProperty("title");
      expect(project).toHaveProperty("customer_title");
      expect(project).toHaveProperty("is_public");
      expect(project).toHaveProperty("bug_form");
      expect(project).toHaveProperty("status");
      expect(project).toHaveProperty("type");
      expect(project).toHaveProperty("family");
      expect(project).toHaveProperty("project");
      expect(project).toHaveProperty("outputs");
    });
  });

  it("Should return a list formatted for pagination", async () => {
    const response = await request(app)
      .get(`/projects/${project_1.id}/campaigns`)
      .set("authorization", "Bearer user");

    expect(response.body).toStrictEqual({
      items: [
        expect.objectContaining({
          id: campaign_1.id,
          title: campaign_1.title,
          customer_title: campaign_1.customer_title,
          is_public: campaign_1.is_public,
          start_date: new Date(campaign_1.start_date).toISOString(),
          end_date: new Date(campaign_1.end_date).toISOString(),
          close_date: new Date(campaign_1.close_date).toISOString(),
          bug_form: campaign_1.campaign_type,
          status: {
            id: campaign_1.status_id,
            name: "running",
          },
          project: {
            id: project_1.id,
            name: project_1.display_name,
          },
          type: {
            id: campaign_1.campaign_type_id,
            name: campaign_type_1.name,
          },
          family: {
            id: campaign_type_1.type,
            name: "Experiential",
          },
          outputs: [],
        }),
        expect.objectContaining({
          id: campaign_2.id,
          title: campaign_2.title,
          customer_title: campaign_2.customer_title,
          is_public: campaign_2.is_public,
          start_date: new Date(campaign_2.start_date).toISOString(),
          end_date: new Date(campaign_2.end_date).toISOString(),
          close_date: new Date(campaign_2.close_date).toISOString(),
          bug_form: 0,
          status: {
            id: campaign_2.status_id,
            name: "running",
          },
          project: {
            id: project_1.id,
            name: project_1.display_name,
          },
          type: {
            id: campaign_2.campaign_type_id,
            name: campaign_type_1.name,
          },
          family: {
            id: campaign_type_1.type,
            name: "Experiential",
          },
          outputs: [],
        }),
      ],
      start: 0,
      limit: LIMIT_QUERY_PARAM_DEFAULT,
      size: 2,
      total: 2,
    });
  });

  //Should return just a campaign if limit is 1
  it("Should return a campaign if limit is 1", async () => {
    const response = await request(app)
      .get(`/projects/${project_1.id}/campaigns?limit=1`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items.length).toBe(1);
  });

  //Should return all campaigns if no limit is specified
  it("Should return a list of campaigns if no limit is specified", async () => {
    const response = await request(app)
      .get(`/projects/${project_1.id}/campaigns`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items).toHaveLength(2); //campaign_1 and campaign_2
    response.body.items.forEach((project: Object) => {
      expect(project).toHaveProperty("id");
      expect(project).toHaveProperty("start_date");
      expect(project).toHaveProperty("end_date");
      expect(project).toHaveProperty("close_date");
      expect(project).toHaveProperty("title");
      expect(project).toHaveProperty("customer_title");
      expect(project).toHaveProperty("is_public");
      expect(project).toHaveProperty("bug_form");
      expect(project).toHaveProperty("status");
      expect(project).toHaveProperty("type");
      expect(project).toHaveProperty("family");
      expect(project).toHaveProperty("project");
    });
  });

  describe("Outputs", () => {
    afterEach(async () => {
      await bugs.clear();
      await userTaskMedia.clear();
      await useCases.clear();
      await tryber.tables.UxCampaignData.do().delete();
    });

    // Should return a bug output if campaign has bug output
    it("Should return a bug output if campaign has bug output", async () => {
      await bugs.insert({
        id: 123,
        campaign_id: campaign_1.id,
        message: "Bug 1",
        wp_user_id: 1,
      });

      const response = await request(app)
        .get(`/projects/${project_1.id}/campaigns?limit=1`)
        .set("authorization", "Bearer user");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items).toHaveLength(1);

      expect(response.body.items[0].outputs).toHaveLength(1);
      expect(response.body.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            outputs: expect.arrayContaining(["bugs"]),
          }),
        ])
      );
    });

    // Should return all outputs available
    it("Should return all outputs available", async () => {
      await bugs.insert({
        id: 123,
        campaign_id: campaign_1.id,
        message: "Bug 1",
        wp_user_id: 1,
      });

      await useCases.insert({
        id: 456,
        campaign_id: campaign_1.id,
        title: "Use Case 1",
        content: "Use Case 1 description",
      });

      await userTaskMedia.insert({
        id: 789,
        campaign_task_id: 456,
        location: "http://image1.com",
        status: 2,
      });

      await tryber.tables.UxCampaignData.do().insert({
        id: 1,
        campaign_id: campaign_1.id,
        published: 1,
        version: 1,
        goal: "Goal 1",
      });

      const response = await request(app)
        .get(`/projects/${project_1.id}/campaigns?limit=1`)
        .set("authorization", "Bearer user");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.items)).toBe(true);
      expect(response.body.items).toHaveLength(1);

      expect(response.body.items[0].outputs).toHaveLength(3);
      expect(response.body.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            outputs: expect.arrayContaining(["bugs", "media", "insights"]),
          }),
        ])
      );
    });
  });

  // Should order by the default ordering if the order parameter is not valid or not provided
  it("Should order by the default ordering if the order parameter is not valid or not provided", async () => {
    const response = await request(app)
      .get(`/projects/${project_1.id}/campaigns?order=wrong`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([
      expect.objectContaining({
        id: campaign_1.id,
      }),
      expect.objectContaining({
        id: campaign_2.id,
      }),
    ]);
  });

  // Should order by the default ordering if the order parameter is valid and orderBy is not provided
  it("Should order by the default ordering if the order parameter is valid and orderBy is not provided", async () => {
    const response = await request(app)
      .get(`/projects/${project_1.id}/campaigns?order=DESC`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([
      expect.objectContaining({
        id: campaign_1.id,
      }),
      expect.objectContaining({
        id: campaign_2.id,
      }),
    ]);
  });

  // Should order items by the provided orderBy and order
  it("Should order items by the provided orderBy and order", async () => {
    const response = await request(app)
      .get(`/projects/${project_1.id}/campaigns?order=DESC&orderBy=start_date`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([
      expect.objectContaining({
        id: campaign_2.id,
      }),
      expect.objectContaining({
        id: campaign_1.id,
      }),
    ]);
  });

  // end of describe
});
