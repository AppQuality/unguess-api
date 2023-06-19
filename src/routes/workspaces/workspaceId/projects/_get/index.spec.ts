import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { ERROR_MESSAGE, LIMIT_QUERY_PARAM_DEFAULT } from "@src/utils/constants";
import { tryber } from "@src/features/database";

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

const campaign_1 = {
  id: 1,
  start_date: "2017-07-20 00:00:00",
  end_date: "2017-07-20 00:00:00",
  close_date: "2017-07-20 00:00:00",
  title: "Campagnetta Funzionale Provetta 1",
  customer_title: "titolo 1",
  description: "Descrizione della campagnazione 1",
  status_id: 1,
  is_public: 0,
  campaign_type_id: 1,
  project_id: 1,
  customer_id: 2,
};

const campaign_2 = {
  id: 2,
  start_date: "2017-07-20 00:00:00",
  end_date: "2017-07-20 00:00:00",
  close_date: "2017-07-20 00:00:00",
  title: "Campagnetta Funzionale Provetta 2",
  customer_title: "titolo 2",
  description: "Descrizione della campagnazione 2",
  status_id: 1,
  is_public: 0,
  campaign_type_id: 1,
  project_id: 1,
  customer_id: 2,
};

const campaign_3 = {
  id: 3,
  start_date: "2017-07-20 00:00:00",
  end_date: "2017-07-20 00:00:00",
  close_date: "2017-07-20 00:00:00",
  title: "Campagnetta Funzionale Provetta 3",
  customer_title: "titolo 3",
  description: "Descrizione della campagnazione 3",
  status_id: 1,
  is_public: 0,
  campaign_type_id: 1,
  project_id: 3,
  customer_id: 2,
};

describe("GET /workspaces/{wid}/projects", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.add({
          campaigns: [campaign_1, campaign_2, campaign_3],
          profiles: [customer_profile_1],
          companies: [customer_1, customer_2],
          projects: [project_1, project_2, project_3],
          userToCustomers: [user_to_customer_1, user_to_customer_2],
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  it("Should answer 200 if logged in", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}/projects`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).get(
      `/workspaces/${customer_1.id}/projects`
    );
    expect(response.status).toBe(403);
  });

  it("Should answer with only the visible projects", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}/projects`)
      .set("authorization", "Bearer user");
    expect(response.body).toEqual({
      items: [
        {
          id: project_1.id,
          name: project_1.display_name,
          campaigns_count: 2,
          workspaceId: project_1.customer_id,
        },
        {
          id: project_3.id,
          name: project_3.display_name,
          campaigns_count: 1,
          workspaceId: project_3.customer_id,
        },
      ],
      start: 0,
      limit: LIMIT_QUERY_PARAM_DEFAULT,
      size: 2,
      total: 2,
    });
  });

  it("Should answer with only one visible project because of limit 1", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}/projects?start=0&limit=1`)
      .set("authorization", "Bearer user");
    expect(JSON.stringify(response.body)).toStrictEqual(
      JSON.stringify({
        items: [
          {
            id: project_1.id,
            name: project_1.display_name,
            campaigns_count: 2,
            workspaceId: project_1.customer_id,
          },
        ],
        start: 0,
        limit: 1,
        size: 1,
        total: 2,
      })
    );
  });

  it("Should answer 400 if wid is a string", async () => {
    const response = await request(app)
      .get(`/workspaces/asd/projects`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should return 403 if workspace is not found", async () => {
    const result = await request(app)
      .get(`/workspaces/9999/projects`)
      .set("authorization", "Bearer user");
    expect(result.body.code).toBe(403);
  });

  it("Should return a list of projects if customer is present and has some projects", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}/projects`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.items.length).toBeGreaterThan(0);
    response.body.items.forEach((project: Object) => {
      expect(project).toHaveProperty("id");
      expect(project).toHaveProperty("name");
      expect(project).toHaveProperty("campaigns_count");
    });
  });

  it("Should return only the projects that the user can see", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}/projects`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(JSON.stringify(response.body)).toStrictEqual(
      JSON.stringify({
        items: [
          {
            id: project_1.id,
            name: project_1.display_name,
            campaigns_count: 2,
            workspaceId: project_1.customer_id,
          },
          {
            id: project_3.id,
            name: project_3.display_name,
            campaigns_count: 1,
            workspaceId: project_3.customer_id,
          },
        ],
        start: 0,
        limit: LIMIT_QUERY_PARAM_DEFAULT,
        size: 2,
        total: 2,
      })
    );
  });

  it("Should return only the projects that the user can see with the correct campaigns count", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}/projects`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(JSON.stringify(response.body)).toStrictEqual(
      JSON.stringify({
        items: [
          {
            id: project_1.id,
            name: project_1.display_name,
            campaigns_count: 2,
            workspaceId: project_1.customer_id,
          },
          {
            id: project_3.id,
            name: project_3.display_name,
            campaigns_count: 1,
            workspaceId: project_3.customer_id,
          },
        ],
        start: 0,
        limit: LIMIT_QUERY_PARAM_DEFAULT,
        size: 2,
        total: 2,
      })
    );
  });

  it("Should return 200 and a Project if the user is not a workspace member BUT has access to some sub-projects", async () => {
    await tryber.tables.WpAppqCustomer.do().insert({
      ...customer_1,
      id: 1234,
      pm_id: 32,
    });

    await tryber.tables.WpAppqProject.do().insert({
      id: 567,
      display_name: "Progettino uno",
      customer_id: 1234,
      edited_by: 32,
    });

    await tryber.tables.WpAppqUserToProject.do().insert({
      wp_user_id: 1,
      project_id: 567,
    });

    const response = await request(app)
      .get(`/workspaces/1234/projects`)
      .set("authorization", "Bearer user");

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 567,
          name: "Progettino uno",
          campaigns_count: 0,
          workspaceId: 1234,
        }),
      ])
    );

    expect(response.body.start).toEqual(0);
    expect(response.body.size).toEqual(1);
    expect(response.body.total).toEqual(1);
  });

  it("Should return 403 if the users has shared items but nothing related to the workspace", async () => {
    await tryber.tables.WpAppqCustomer.do().insert({
      ...customer_1,
      id: 2222,
      pm_id: 32,
    });

    await tryber.tables.WpAppqProject.do().insert({
      id: 3333,
      display_name: "Progettino uno",
      customer_id: 2222,
      edited_by: 32,
    });

    await tryber.tables.WpAppqUserToProject.do().insert({
      wp_user_id: 123, // another user
      project_id: 567,
    });

    const response = await request(app)
      .get(`/workspaces/2222/projects`)
      .set("authorization", "Bearer user");

    expect(response.status).toBe(403);
    expect(response.body.message).toBe(
      "Workspace doesn't exist or not accessible"
    );
  });

  // End of describe
});
