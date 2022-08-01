import app from "@src/app";
import request from "supertest";

import Templates from "@src/__mocks__/database/templates";
import Category from "@src/__mocks__/database/template_categories";

describe("GET /templates", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        Templates.mock();
        Category.mock();

        Category.insert({
          id: 1,
          name: "Category 1",
        });

        Templates.insert({
          title: "Template 1",
          description: "Template 1 description",
          content: "<h1>Template 1</h1><p>content</p>",
          category_id: 1,
          device_type: "webapp",
          image: "https://placehold.it/300x300",
        });

        console.log("Templates: ", await Templates.all());
        console.log("Categories: ", await Category.all());
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
        Templates.dropMock();
        Category.dropMock();
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  it("Should answer 200 if logged in", async () => {
    const response = await request(app)
      .get("/templates")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
  });

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).get("/templates");
    expect(response.status).toBe(403);
  });

  it("Should return a list of templates", async () => {
    const response = await request(app)
      .get("/templates")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);

    console.log("CIOLLONA", response.body);
  });
});
