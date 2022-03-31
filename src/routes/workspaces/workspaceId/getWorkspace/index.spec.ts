import app from "@src/app";
import request from "supertest";
import db from "@src/features/sqlite";
import getWorkspace from ".";

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

const customer_profile_1 = {
  id: 1,
  wp_user_id: 1,
  name: "Customer",
  surname: "Customer",
  email: "customer@unguess.io",
};

describe("", () => {
  beforeAll(async () => {
    return new Promise(async (resolve) => {
      try {
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

        await tryberDb.createTable("wp_appq_project", [
          "id int(11) PRIMARY KEY",
          "display_name VARCHAR(64)",
          "customer_id int(11)",
        ]);

        await unguessDb.insert("wp_users", customer_user_1);
        await unguessDb.insert("wp_appq_evd_profile", customer_profile_1);
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
        await unguessDb.dropTable("wp_appq_evd_profile");
        await tryberDb.dropTable("wp_appq_customer");
        await tryberDb.dropTable("wp_appq_user_to_customer");
        await tryberDb.dropTable("wp_appq_project");
      } catch (error) {
        console.error(error);
      }

      resolve(true);
    });
  });

  it('Should throw "No workspace found" error on no results', async () => {
    try {
      await getWorkspace(9999);
      fail("Should throw error");
    } catch (error) {
      expect((error as OpenapiError).message).toBe("No workspace found");
    }
  });

  it("Should have all the required fields", async () => {
    try {
      const workspace = (await getWorkspace(1)) as Workspace;
      const { company, id, tokens } = workspace;
      expect(company).not.toBeNull();
      expect(id).not.toBeNull();
      expect(tokens).not.toBeNull();
    } catch (e) {
      console.log(e);
    }
  });

  it("Should have all the types matching the requirements", async () => {
    try {
      const workspace = (await getWorkspace(1)) as Workspace;
      const { company, id, tokens } = workspace;
      console.log(workspace);
      expect(typeof company).toBe("string");
      expect(typeof tokens).toBe("number");
      expect(typeof id).toBe("number");
    } catch (e) {
      console.log(e);
    }
  });

  it("Should return a workspace", async () => {
    try {
      let workspace = await getWorkspace(1);
      expect(JSON.stringify(workspace)).toBe(
        JSON.stringify({
          id: customer_1.id,
          company: customer_1.company,
          logo: customer_1.company_logo,
          tokens: customer_1.tokens,
        })
      );
    } catch (error) {
      console.error(error);
    }
  });
});
