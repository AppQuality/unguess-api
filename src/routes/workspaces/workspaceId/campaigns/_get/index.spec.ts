import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { ERROR_MESSAGE, LIMIT_QUERY_PARAM_DEFAULT } from "@src/utils/consts";

const customer_1 = {
  id: 1,
  company: "Company",
  company_logo: "logo.png",
  tokens: 100,
};

const customer_2 = {
  id: 2,
  company: "Company",
  company_logo: "logo.png",
  tokens: 100,
};

const customer_3 = {
  id: 43,
  company: "Company",
  company_logo: "logo.png",
  tokens: 100,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 1,
};

const user_to_customer_2 = {
  wp_user_id: 1,
  customer_id: 2,
};

const customer_profile_1 = {
  id: 1,
  wp_user_id: 1,
  name: "Customer",
  surname: "Customer",
  email: "customer@unguess.io",
};

const campaign_1 = {
  id: 42,
  start_date: "2017-07-20 00:00:00",
  end_date: "2017-07-20 00:00:00",
  close_date: "2017-07-20 00:00:00",
  title: "Campagnetta Provetta ",
  customer_title: "titolo",
  description: "Descrizione della campagnazione",
  status_id: 1,
  is_public: 0,
  campaign_type_id: 1,
  project_id: 1,
  customer_id: 1,
  campaign_type: 0,
};

const campaign_2 = {
  id: 43,
  start_date: "2016-07-20 00:00:00",
  end_date: "2016-07-20 00:00:00",
  close_date: "2016-07-20 00:00:00",
  title: "Campagnetta Provetta ",
  customer_title: "titolo",
  description: "Descrizione della campagnazione",
  status_id: 2,
  is_public: 0,
  campaign_type_id: 1,
  project_id: 2,
  customer_id: 2,
  campaign_type: 0,
};

const campaign_3 = {
  id: 44,
  start_date: "2017-07-20 00:00:00",
  end_date: "2017-07-20 00:00:00",
  close_date: "2017-07-20 00:00:00",
  title: "Campagnetta della banana",
  customer_title: "titolo",
  description: "Descrizione della campagnazione",
  status_id: 1,
  is_public: 0,
  campaign_type_id: 2,
  project_id: 2,
  customer_id: 2,
  campaign_type: 0,
};

const project_2 = {
  id: 2,
  display_name: "Nome del progetto abbastanza figo",
  customer_id: 2,
  last_edit: "2017-07-20 00:00:00",
};

const project_1 = {
  id: 1,
  display_name: "Nome del progetto abbastanza figo",
  customer_id: 1,
  last_edit: "2017-07-20 00:00:00",
};

const campaign_type_1 = {
  id: 1,
  name: "Banana campaign",
  type: 1,
};

const campaign_type_2 = {
  id: 2,
  name: "NANANANANANNA BATMAN",
  type: 1,
};

describe("GET /workspaces/{wid}/campaigns", () => {
  beforeAll(async () => {
    return new Promise(async (res, rej) => {
      try {
        await dbAdapter.create();

        await dbAdapter.add({
          campaigns: [campaign_1, campaign_2, campaign_3],
          profiles: [customer_profile_1],
          projects: [project_1, project_2],
          campaignTypes: [campaign_type_1, campaign_type_2],
          companies: [customer_1, customer_2, customer_3],
          userToCustomers: [user_to_customer_1, user_to_customer_2],
        });
      } catch (e) {
        console.error(e);
        rej(e);
      }
      res(true);
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

  it("Should return 403 status if user is not logged in", async () => {
    const response = await request(app).get("/workspaces/1/campaigns");
    expect(response.status).toBe(403);
  });

  it("Should return 200 status if user is logged in", async () => {
    const response = await request(app)
      .get("/workspaces/1/campaigns")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
  });

  it("Should return 400 if the request parameter has a bad format", async () => {
    const response = await request(app)
      .get("/workspaces/banana/campaigns")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(400);
  });

  it("Should return 403 if the customer is not found", async () => {
    const response = await request(app)
      .get("/workspaces/999898978/campaigns")
      .set("authorization", "Bearer customer");
    expect(response.body.code).toBe(403);
    expect(response.body.message).toBe(ERROR_MESSAGE);
  });

  it("Should return an array of 1 elements because of limit = 1", async () => {
    const response = await request(app)
      .get("/workspaces/2/campaigns?limit=1&start=0")
      .set("authorization", "Bearer customer");
    expect(response.body.items.length).toBe(1);
  });

  it("Should return an array of 1 element because start is set to 1", async () => {
    const response = await request(app)
      .get("/workspaces/2/campaigns?limit=1&start=1")
      .set("authorization", "Bearer customer");
    expect(response.body.items.length).toBe(1);
  });

  it("Should return an error 400 if the limit is not a number", async () => {
    const response = await request(app)
      .get("/workspaces/2/campaigns?limit=asd&start=1")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(400);
    expect(response.body.err[0].message).toBe("should be number");
  });

  it("Should return an array of campaigns", async () => {
    const response = await request(app)
      .get("/workspaces/1/campaigns")
      .set("authorization", "Bearer customer");
    expect(JSON.stringify(response.body)).toBe(
      JSON.stringify({
        items: [
          {
            id: campaign_1.id,
            start_date: campaign_1.start_date,
            end_date: campaign_1.end_date,
            close_date: campaign_1.close_date,
            title: campaign_1.title,
            customer_title: campaign_1.customer_title,
            is_public: campaign_1.is_public,
            bug_form: campaign_1.campaign_type,
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
              id: campaign_1.project_id,
              name: project_1.display_name,
            },
          },
        ],
        start: 0,
        limit: LIMIT_QUERY_PARAM_DEFAULT,
        size: 1,
        total: 1,
      })
    );
  });

  it("Should return an array of campaigns with 2 elements because no limit or start are in the request", async () => {
    const response = await request(app)
      .get("/workspaces/2/campaigns")
      .set("authorization", "Bearer customer");
    expect(Array.isArray(response.body.items)).toBeTruthy();
    expect(JSON.stringify(response.body)).toStrictEqual(
      JSON.stringify({
        items: [
          {
            id: campaign_2.id,
            start_date: campaign_2.start_date,
            end_date: campaign_2.end_date,
            close_date: campaign_2.close_date,
            title: campaign_2.title,
            customer_title: campaign_2.customer_title,
            is_public: campaign_2.is_public,
            bug_form: campaign_2.campaign_type,
            status: {
              id: campaign_2.status_id,
              name: "completed",
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
              id: campaign_2.project_id,
              name: project_1.display_name,
            },
          },
          {
            id: campaign_3.id,
            start_date: campaign_3.start_date,
            end_date: campaign_3.end_date,
            close_date: campaign_3.close_date,
            title: campaign_3.title,
            customer_title: campaign_3.customer_title,
            is_public: campaign_3.is_public,
            bug_form: campaign_3.campaign_type,
            status: {
              id: campaign_3.status_id,
              name: "running",
            },
            type: {
              id: campaign_type_2.id,
              name: campaign_type_2.name,
            },
            family: {
              id: campaign_type_2.type,
              name: "Experiential",
            },
            project: {
              id: campaign_3.project_id,
              name: project_1.display_name,
            },
          },
        ],
        start: 0,
        limit: LIMIT_QUERY_PARAM_DEFAULT,
        size: 2,
        total: 2,
      })
    );
  });

  it("Should return 400 because the order parameter is wrong", async () => {
    const response = await request(app)
      .get("/workspaces/1/campaigns?order=banana")
      .set("authorization", "Bearer customer");
    expect(response.body.code).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGE);
  });

  it("Should return 400 because the orderBy parameter is wrong", async () => {
    const response = await request(app)
      .get("/workspaces/1/campaigns?orderBy=BANANA")
      .set("authorization", "Bearer customer");
    expect(response.body.code).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGE);
  });

  it("Should return 400 because the order parameter is wrong but the orderBy is valid", async () => {
    const response = await request(app)
      .get("/workspaces/1/campaigns?order=DESC&orderBy=banana")
      .set("authorization", "Bearer customer");
    expect(response.body.code).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGE);
  });

  it("Should return an array of campaigns with 2 elements in reverse order", async () => {
    const response = await request(app)
      .get("/workspaces/2/campaigns?order=DESC&orderBy=start_date")
      .set("authorization", "Bearer customer");
    expect(Array.isArray(response.body.items)).toBeTruthy();
    expect(JSON.stringify(response.body)).toStrictEqual(
      JSON.stringify({
        items: [
          {
            id: campaign_3.id,
            start_date: campaign_3.start_date,
            end_date: campaign_3.end_date,
            close_date: campaign_3.close_date,
            title: campaign_3.title,
            customer_title: campaign_3.customer_title,
            is_public: campaign_3.is_public,
            bug_form: campaign_3.campaign_type,
            status: {
              id: campaign_3.status_id,
              name: "running",
            },
            type: {
              id: campaign_3.campaign_type_id,
              name: campaign_type_2.name,
            },
            family: {
              id: campaign_type_2.type,
              name: "Experiential",
            },
            project: {
              id: campaign_3.project_id,
              name: project_1.display_name,
            },
          },
          {
            id: campaign_2.id,
            start_date: campaign_2.start_date,
            end_date: campaign_2.end_date,
            close_date: campaign_2.close_date,
            title: campaign_2.title,
            customer_title: campaign_2.customer_title,
            is_public: campaign_2.is_public,
            bug_form: campaign_2.campaign_type,
            status: {
              id: campaign_2.status_id,
              name: "completed",
            },
            type: {
              id: campaign_type_1.id,
              name: campaign_type_1.name,
            },
            family: {
              id: campaign_type_1.type,
              name: "Experiential",
            },
            project: {
              id: campaign_2.project_id,
              name: project_1.display_name,
            },
          },
        ],
        start: 0,
        limit: LIMIT_QUERY_PARAM_DEFAULT,
        size: 2,
        total: 2,
      })
    );
  });

  it("Should return 400 because the filterBy parameter is not allowed", async () => {
    const response = await request(app)
      .get("/workspaces/1/campaigns?filterBy[banana]=banana")
      .set("authorization", "Bearer customer");
    expect(response.body.code).toBe(400);
    expect(response.body.message).toBe(ERROR_MESSAGE);
  });

  it("Should return 200 because the filterBy parameter has the right format", async () => {
    const response = await request(app)
      .get("/workspaces/1/campaigns?filterBy[title]=Campagnetta Provetta ")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
  });

  it("Should return an empty array because no data is found with this value", async () => {
    const response = await request(app)
      .get("/workspaces/1/campaigns?filterBy[title]=banana")
      .set("authorization", "Bearer customer");
    expect(JSON.stringify(response.body)).toStrictEqual(
      JSON.stringify({ items: [], start: 0, limit: 0, size: 0, total: 0 })
    );
  });

  it("Should return one element using title", async () => {
    const response = await request(app)
      .get("/workspaces/2/campaigns?filterBy[title]=Campagnetta della banana")
      .set("authorization", "Bearer customer");
    expect(response.body.items.length).toBe(1);
  });

  it("Should return an array with two elements using project_name", async () => {
    const response = await request(app)
      .get(
        "/workspaces/2/campaigns?filterBy[project_name]=Nome del progetto abbastanza figo"
      )
      .set("authorization", "Bearer customer");
    expect(response.body.items.length).toBe(2);
  });

  it("Should return an array with one element using only a part of the title", async () => {
    const response = await request(app)
      .get("/workspaces/2/campaigns?filterBy[title]=della banana")
      .set("authorization", "Bearer customer");
    expect(response.body.items.length).toBe(1);
  });
});
