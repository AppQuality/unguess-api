import app from "@src/app";
import sqlite3 from "@src/features/sqlite";
import request from "supertest";

jest.mock("@src/features/db");
jest.mock("@appquality/wp-auth");
const tester1 = {
  id: 1,
  name: "John",
  surname: "Doe",
};

const project1 = {
  id: 1,
  name: "Project 1",
  description: "Description 1",
};

const project2 = {
  id: 2,
  name: "Project 2",
  description: "Description 2",
};

const project3 = {
  id: 3,
  name: "Project 3",
  description: "Description 3",
};

describe("Route GET payments", () => {
  beforeAll(async () => {
    return new Promise(async (resolve) => {
      await sqlite3.createTable("wp_appq_evd_profile", [
        "id INTEGER PRIMARY KEY",
        "name VARCHAR(255)",
        "surname VARCHAR(255)",
      ]);

      await sqlite3.createTable("wp_projects", [
        "id INTEGER PRIMARY KEY",
        "name VARCHAR(255)",
        "description VARCHAR(255)",
      ]);

      await sqlite3.insert("wp_appq_evd_profile", tester1);

      await sqlite3.insert("wp_projects", project1);
      await sqlite3.insert("wp_projects", project2);
      await sqlite3.insert("wp_projects", project3);

      resolve(null);
    });
  });
  afterAll(async () => {
    return new Promise(async (resolve) => {
      await sqlite3.dropTable("wp_appq_evd_profile");
      await sqlite3.dropTable("wp_projects");
      resolve(null);
    });
  });

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).get("/projects");
    expect(response.status).toBe(403);
  });
  it("Should answer 403 if logged in with a non-admin user", async () => {
    const response = await request(app)
      .get("/projects")
      .set("authorization", "Bearer tester");
    expect(response.status).toBe(403);
  });
  it("Should answer 200 if logged in with an admin user", async () => {
    const response = await request(app)
      .get("/projects")
      .set("authorization", "Bearer admin");
    expect(response.status).toBe(200);
  });
  it("Should answer with a list of projects on success", async () => {
    const response = await request(app)
      .get("/projects")
      .set("authorization", "Bearer admin");
    expect(response.body).toMatchObject({
      items: [
        {
          id: project1.id,
          name: project1.name,
          description: project1.description,
        },
        {
          id: project2.id,
          name: project2.name,
          description: project2.description,
        },
        {
          id: project3.id,
          name: project3.name,
          description: project3.description,
        },
      ],
    });
  });
});
