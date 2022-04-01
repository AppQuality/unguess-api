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

describe("GET /workspaces", () => {
  beforeAll(async () => {
    return new Promise(async (resolve) => {
      try {
        await tryberDb.createTable("wp_appq_customer", [
          "id int(11) PRIMARY KEY",
          "company varchar(64)",
          "company_logo varchar(300)",
          "tokens int(11)",
        ]);

        await tryberDb.insert("wp_appq_customer", customer_1);

        await tryberDb.createTable("wp_appq_user_to_customer", [
          "wp_user_id int(11) ",
          "customer_id int(11) not null",
        ]);

        await tryberDb.insert("wp_appq_user_to_customer", {
          wp_user_id: 1,
          customer_id: customer_1.id,
        });
      } catch (error) {
        console.log(error);
      }

      resolve(true);
    });
  });

  afterAll(async () => {
    return new Promise(async (resolve) => {
      try {
        await tryberDb.dropTable("wp_appq_customer");
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
      .get("/workspaces")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
  });

  it("Should answer with an array of workspaces", async () => {
    const response = await request(app)
      .get("/workspaces")
      .set("authorization", "Bearer customer");
    expect(response.body).toMatchObject(
      Array({
        id: customer_1.id,
        company: customer_1.company,
        logo: customer_1.company_logo,
        tokens: customer_1.tokens,
      })
    );
  });
});
