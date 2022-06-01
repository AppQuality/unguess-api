import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { ERROR_MESSAGE, LIMIT_QUERY_PARAM_DEFAULT } from "@src/utils/consts";

jest.mock("@src/features/db");
jest.mock("@appquality/wp-auth");

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
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
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
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
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
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campagnetta Funzionale Provetta 3",
  customer_title: "titolo 3",
  description: "Descrizione della campagnazione 3",
  status_id: 1,
  is_public: 0,
  campaign_type_id: 1,
  campaign_type: 0,
  project_id: 3,
};

const campaign_type_1 = {
  id: 1,
  name: "Functional Bug Finding",
  type: 1,
};

describe("GET /workspaces/{wid}/projects/{pid}/campaigns", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.create();

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
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  it("Should answer 200 if logged in", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}/projects/${project_1.id}/campaigns`)
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
  });

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).get(
      `/workspaces/${customer_1.id}/projects/${project_1.id}/campaigns`
    );
    expect(response.status).toBe(403);
  });

  it("Should answer 400 if pid is a string", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}/projects/asd/campaigns`)
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(400);
  });

  it("Should return 403 if project is not found", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}/projects/999/campaigns`)
      .set("authorization", "Bearer customer");
    expect(response.body.code).toBe(403);
    expect(response.body.message).toBe(ERROR_MESSAGE);
  });

  it("Should return a list of campaigns if project is present", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}/projects/${project_1.id}/campaigns`)
      .set("authorization", "Bearer customer");
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
    });
  });

  it("Should return a list formatted for pagination", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}/projects/${project_1.id}/campaigns`)
      .set("authorization", "Bearer customer");
    expect(response.body).toStrictEqual({
      items: [
        {
          id: campaign_1.id,
          title: campaign_1.title,
          customer_title: campaign_1.customer_title,
          is_public: campaign_1.is_public,
          start_date: new Date(campaign_1.start_date).toISOString(),
          end_date: new Date(campaign_1.end_date).toISOString(),
          close_date: new Date(campaign_1.close_date).toISOString(),
          bug_form: 0,
          status: {
            id: campaign_1.status_id,
            name: "running",
          },
          type: {
            id: campaign_1.campaign_type_id,
            name: campaign_type_1.name,
          },
          family: {
            id: campaign_type_1.type,
            name: "Experiential",
          },
          project: {
            id: project_1.id,
            name: project_1.display_name,
          },
        },
        {
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
          type: {
            id: campaign_2.campaign_type_id,
            name: campaign_type_1.name,
          },
          family: {
            id: campaign_type_1.type,
            name: "Experiential",
          },
          project: {
            id: project_1.id,
            name: project_1.display_name,
          },
        },
      ],
      start: 0,
      limit: LIMIT_QUERY_PARAM_DEFAULT,
      size: 2,
      total: 2,
    });
  });
});
