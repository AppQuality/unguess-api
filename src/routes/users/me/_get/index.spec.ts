import app from "@src/app";
import request from "supertest";
import db from "@src/features/sqlite";

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
  company: "Company",
  company_logo: "logo.png",
  tokens: 100,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 1,
};

describe("GET /users/me", () => {
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

        await unguessDb.insert("wp_users", customer_user_1);
        await unguessDb.insert("wp_users", admin_user_1);
        await tryberDb.insert("wp_appq_evd_profile", customer_profile_1);
        await tryberDb.insert("wp_appq_customer", customer_1);
        await tryberDb.insert("wp_appq_user_to_customer", user_to_customer_1);
      } catch (error) {
        console.log(error);
      }

      resolve(true);
    });
  });
  afterAll(async () => {
    return new Promise(async (resolve) => {
      await unguessDb.dropTable("wp_users");
      await tryberDb.dropTable("wp_appq_evd_profile");
      await tryberDb.dropTable("wp_appq_customer");
      await tryberDb.dropTable("wp_appq_user_to_customer");
      resolve(true);
    });
  });

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).get("/users/me");
    expect(response.status).toBe(403);
  });

  it("Should answer 200 if logged in", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
  });

  it("Should return a profile_id if customer", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer customer");
    expect(response.body.role).toBe("customer");
    expect(response.body).toHaveProperty("profile_id");
    expect(response.body.profile_id).toBe(1);
  });

  it("Should not return a profile_id if administrator", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer administrator");
    expect(response.body.role).toBe("administrator");
    expect(response.body).not.toHaveProperty("profile_id");
    expect(response.body).not.toHaveProperty("tryber_wp_user_id");
  });

  it("Should return a customer name if customer", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer customer");
    expect(response.body.role).toBe("customer");
    expect(response.body).toHaveProperty("name");
    expect(response.body.name).not.toBe("Name Surname");
  });

  it("Should return the user workspaces", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer customer");
    expect(response.body.role).toBe("customer");
    expect(response.body).toHaveProperty("workspaces");
  });
});
