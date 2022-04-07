import app from "@src/app";
import request from "supertest";
import db from "@src/features/sqlite";

jest.mock("@src/features/db");
jest.mock("@appquality/wp-auth");

const unguessDb = db("unguess");
const tryberDb = db("tryber");

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

const customer_user_1 = {
  ID: 1,
  user_login: "customer@unguess.io",
  user_pass: "password",
  user_email: "customer@unguess.io",
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
};

const campaign_2 = {
  id: 43,
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
  customer_id: 2,
};

const campaign_3 = {
  id: 44,
  start_date: "2017-07-20 00:00:00",
  end_date: "2017-07-20 00:00:00",
  close_date: "2017-07-20 00:00:00",
  title: "Campagnetta Provetta ",
  customer_title: "titolo",
  description: "Descrizione della campagnazione",
  status_id: 1,
  is_public: 0,
  campaign_type_id: 2,
  project_id: 1,
  customer_id: 2,
};

const project_1 = {
  id: 1,
  display_name: "Nome del progetto abbastanza figo",
  customer_id: 123,
  edited_by: 42,
  created_on: "2017-07-20 00:00:00",
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
    return new Promise(async (resolve) => {
      try {
        await tryberDb.createTable("wp_appq_evd_campaign", [
          "id int(11) PRIMARY KEY",
          "start_date datetime",
          "end_date datetime",
          "close_date datetime",
          "title varchar(256)",
          "customer_title varchar(256)",
          "description varchar(512)",
          "status_id int(1)",
          "is_public int(1)",
          "campaign_type_id int(11)",
          "project_id int(11)",
          "customer_id int(11)",
        ]);
        await tryberDb.createTable("wp_appq_project", [
          "id int(11) PRIMARY KEY",
          "display_name varchar(64)",
          "customer_id int(11)",
          "edited_by int(11)",
          "created_on timestamp",
          "last_edit timestamp",
        ]);
        await tryberDb.createTable("wp_appq_campaign_type", [
          "id int(11)",
          "name varchar(45)",
          "type int(11)",
        ]);

        await unguessDb.createTable("wp_users", [
          "ID int(11) PRIMARY KEY",
          "user_login VARCHAR(60)",
          "user_pass VARCHAR(255)",
          "user_email VARCHAR(100)",
        ]);

        await tryberDb.createTable("wp_appq_customer", [
          "id int(11) PRIMARY KEY",
          "company varchar(64)",
          "company_logo varchar(300)",
          "tokens int(11)",
        ]);

        await unguessDb.createTable("wp_appq_evd_profile", [
          "id int(11) PRIMARY KEY",
          "wp_user_id int(20)",
          "name VARCHAR(45)",
          "surname VARCHAR(45)",
          "email VARCHAR(100)",
        ]);

        await tryberDb.createTable("wp_appq_user_to_customer", [
          "wp_user_id int(11)",
          "customer_id int(11)",
        ]);

        await unguessDb.insert("wp_users", customer_user_1);
        await unguessDb.insert("wp_appq_evd_profile", customer_profile_1);
        await tryberDb.insert("wp_appq_customer", customer_1);
        await tryberDb.insert("wp_appq_customer", customer_2);
        await tryberDb.insert("wp_appq_customer", customer_3);
        await tryberDb.insert("wp_appq_user_to_customer", user_to_customer_1);
        await tryberDb.insert("wp_appq_user_to_customer", user_to_customer_2);
        await tryberDb.insert("wp_appq_project", project_1);
        await tryberDb.insert("wp_appq_evd_campaign", campaign_1);
        await tryberDb.insert("wp_appq_evd_campaign", campaign_2);
        await tryberDb.insert("wp_appq_evd_campaign", campaign_3);
        await tryberDb.insert("wp_appq_campaign_type", campaign_type_1);
        await tryberDb.insert("wp_appq_campaign_type", campaign_type_2);
      } catch (e) {
        console.log(e);
      }
      resolve(true);
    });
  });

  afterAll(async () => {
    return new Promise(async (resolve) => {
      try {
        await unguessDb.dropTable("wp_users");
        await unguessDb.dropTable("wp_appq_evd_profile");
        await tryberDb.dropTable("wp_appq_customer");
        await tryberDb.dropTable("wp_appq_user_to_customer");
        await tryberDb.dropTable("wp_appq_evd_campaign");
        await tryberDb.dropTable("wp_appq_project");
        await tryberDb.dropTable("wp_appq_campaign_type");
      } catch (error) {
        console.error(error);
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

  it("Should return 400 if the query parameter limit is not integer", async () => {
    const response = await request(app)
      .get("/workspaces/1/campaigns?limit=banana")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(400);
  });

  it("Should return 400 if the query parameter start is not integer", async () => {
    const response = await request(app)
      .get("/workspaces/1/campaigns?limit=10&start=banana")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(400);
  });

  it("Should return 400 if the query parameters start and limit are not integer", async () => {
    const response = await request(app)
      .get("/workspaces/1/campaigns?limit=banana&start=banana")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(400);
  });

  it("Should return 404 if the customer is not found", async () => {
    const response = await request(app)
      .get("/workspaces/999898978/campaigns")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(404);
  });

  it("Should return an array of 1 elements because of limit = 1", async () => {
    const response = await request(app)
      .get("/workspaces/2/campaigns?limit=1&start=0")
      .set("authorization", "Bearer customer");
    expect(response.body.items.length).toBe(1);
  });

  it("Should return 400 because only start is passed", async () => {
    const response = await request(app)
      .get("/workspaces/2/campaigns?start=1")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(400);
  });

  it("Should return 400 because only limit is passed", async () => {
    const response = await request(app)
      .get("/workspaces/2/campaigns?limit=1")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(400);
  });

  it("Should return an array of 1 element because start is set to 1", async () => {
    const response = await request(app)
      .get("/workspaces/2/campaigns?limit=1&start=1")
      .set("authorization", "Bearer customer");
    expect(response.body.items.length).toBe(1);
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
            description: campaign_1.description,
            status_id: campaign_1.status_id,
            is_public: campaign_1.is_public,
            campaign_type_id: campaign_type_1.id,
            campaign_type_name: campaign_type_1.name,
            test_type_name:
              campaign_type_1.type === 1 ? "Experiential" : "Functional",
            project_id: campaign_1.project_id,
            customer_id: campaign_1.customer_id,
            project_name: project_1.display_name,
          },
        ],
        size: 1,
        total: 1,
      })
    );
  });

  it("Should return an array of campaigns with 2 elements because no limit or start are in the request", async () => {
    const response = await request(app)
      .get("/workspaces/2/campaigns")
      .set("authorization", "Bearer customer");
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
            description: campaign_2.description,
            status_id: campaign_2.status_id,
            is_public: campaign_2.is_public,
            campaign_type_id: campaign_type_1.id,
            campaign_type_name: campaign_type_1.name,
            test_type_name:
              campaign_type_1.type === 1 ? "Experiential" : "Functional",
            project_id: campaign_2.project_id,
            customer_id: campaign_2.customer_id,
            project_name: project_1.display_name,
          },
          {
            id: campaign_3.id,
            start_date: campaign_3.start_date,
            end_date: campaign_3.end_date,
            close_date: campaign_3.close_date,
            title: campaign_3.title,
            customer_title: campaign_3.customer_title,
            description: campaign_3.description,
            status_id: campaign_3.status_id,
            is_public: campaign_3.is_public,
            campaign_type_id: campaign_type_2.id,
            campaign_type_name: campaign_type_2.name,
            test_type_name:
              campaign_type_1.type === 1 ? "Experiential" : "Functional",
            project_id: campaign_3.project_id,
            customer_id: campaign_3.customer_id,
            project_name: project_1.display_name,
          },
        ],
        size: 2,
        total: 2,
      })
    );
  });

  it("Should return empty an array of campaigns and page if no campaign are found for that customer", async () => {
    try {
      const response = await request(app)
        .get("/workspaces/43/campaigns")
        .set("authorization", "Bearer customer");
      expect(JSON.stringify(response.body)).toStrictEqual(
        JSON.stringify({
          items: [],
          total: 0,
        })
      );
    } catch (e) {
      console.log(e);
    }
  });
});
