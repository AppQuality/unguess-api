import app from "@src/app";
import request from "supertest";
import db from "@src/features/sqlite";
import getWorkspace from "../../getWorkspace";

jest.mock("@src/features/db");
jest.mock("@appquality/wp-auth");

const unguessDb = db("unguess");
const tryberDb = db("tryber");

const customer_user_1 = {
  ID: 1,
  user_login: "customer@unguess.io",
  user_pass: "password",
  user_email: "customer@unguess.io",
};

const admin_user_1 = {
  ID: 2,
  user_login: "admin@unguess.io",
  user_pass: "password",
  user_email: "admin@unguess.io",
};

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
  wp_user_id: 1,
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
  customer_id: 1,
};

describe("GET /workspaces/{wid}/projects", () => {
  beforeAll(async () => {
    return new Promise(async (resolve) => {
      try {
        await unguessDb.createTable("wp_users", [
          "ID int(11) PRIMARY KEY",
          "user_login VARCHAR(60)",
          "user_pass VARCHAR(255)",
          "user_email VARCHAR(100)",
        ]);

        await tryberDb.createTable("wp_appq_evd_profile", [
          "id int(11) PRIMARY KEY",
          "wp_user_id int(20)",
          "name VARCHAR(45)",
          "surname VARCHAR(45)",
          "email VARCHAR(100)",
        ]);

        await tryberDb.createTable("wp_appq_customer", [
          "id int(11) PRIMARY KEY",
          "company varchar(64)",
          "company_logo varchar(300)",
          "tokens int(11)",
        ]);

        await tryberDb.createTable("wp_appq_user_to_customer", [
          "wp_user_id int(11)",
          "customer_id int(11)",
        ]);

        await tryberDb.createTable("wp_appq_project", [
          "id int(11)",
          "display_name varchar(64)",
          "customer_id int(11)",
        ]);

        await unguessDb.insert("wp_users", customer_user_1);
        await unguessDb.insert("wp_users", admin_user_1);
        await tryberDb.insert("wp_appq_evd_profile", customer_profile_1);
        await tryberDb.insert("wp_appq_customer", customer_1);
        await tryberDb.insert("wp_appq_customer", customer_2);
        await tryberDb.insert("wp_appq_user_to_customer", user_to_customer_1);
        await tryberDb.insert("wp_appq_user_to_customer", user_to_customer_2);
        await tryberDb.insert("wp_appq_project", project_1);
        await tryberDb.insert("wp_appq_project", project_2);
      } catch (error) {
        console.log(error);
      }

      resolve(true);
    });
  });

  afterAll(async () => {
    return new Promise(async (resolve) => {
      try {
        await unguessDb.dropTable("wp_users");
        await tryberDb.dropTable("wp_appq_evd_profile");
        await tryberDb.dropTable("wp_appq_customer");
        await tryberDb.dropTable("wp_appq_user_to_customer");
      } catch (error) {
        console.log(error);
      }

      resolve(true);
    });
  });

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).get("/workspaces");
    expect(response.status).toBe(403);
  });

  it("Should answer 200 if logged in", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_1.id}/projects`)
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
  });

  it("Should answer 400 if wid is a string", async () => {
    const response = await request(app)
      .get(`/workspaces/asd/projects`)
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(400);
  });

  it("Should throw an error 'No workspace found' if workspace is not found", async () => {
    try {
      const response = await request(app)
        .get(`/workspaces/9999/projects`)
        .set("authorization", "Bearer customer");
    } catch (error) {
      expect((error as OpenapiError).message).toBe("No workspace found");
    }
  });

  it("Should return a list of projects if customer is present and has some projects", async () => {
    try {
      let workspace = await getWorkspace(customer_1.id);
      expect(workspace).toHaveProperty("id");
      expect(workspace).toHaveProperty("company");
      expect(workspace).toHaveProperty("tokens");

      const response = await request(app)
        .get(`/workspaces/${customer_1.id}/projects`)
        .set("authorization", "Bearer customer");
      expect(response.status).toBe(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      response.body.forEach((project: Object) => {
        expect(project).toHaveProperty("id");
        expect(project).toHaveProperty("name");
        expect(project).toHaveProperty("campaigns_count");
      });
    } catch (error) {
      console.log(error);
      expect((error as OpenapiError).message).toBe("No workspace found");
    }
  });

  it("Should return an empty list if customer is present but has no projects", async () => {
    try {
      let workspace = await getWorkspace(customer_2.id);
      expect(workspace).toHaveProperty("id");
      expect(workspace).toHaveProperty("company");
      expect(workspace).toHaveProperty("tokens");

      const response = await request(app)
        .get(`/workspaces/${customer_2.id}/projects`)
        .set("authorization", "Bearer customer");
      expect(response.status).toBe(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    } catch (error) {
      console.log(error);
      expect((error as OpenapiError).message).toBe("No workspace found");
    }
  });
});
