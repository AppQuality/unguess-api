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

        Category.insert({
          id: 2,
          name: "Category 2",
        });

        Templates.insert({
          title: "Template 1",
          description: "Template 1 description",
          content: "<h1>Template 1</h1><p>content</p>",
          category_id: 1,
          device_type: "webapp",
          requires_login: 1,
          image: "https://placehold.it/300x300",
        });

        Templates.insert({
          title: "Template 2",
          description: "Template 2 description",
          content: "<h1>Template 2</h1><p>content</p>",
          category_id: 123,
          device_type: "webapp",
          image: "https://placehold.it/300x300",
        });

        Templates.insert({
          title: "Template 3",
          description: "Template 3 description",
          content: "<h1>Template 3</h1><p>content</p>",
          category_id: 2,
          device_type: "mobileapp",
          locale: "it",
          image: "https://placehold.it/300x300",
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
    expect(response.body.length).toBe(3);
  });

  it("Should return an Uncategorized category for templates without a valid category", async () => {
    const response = await request(app)
      .get("/templates")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body[1].category.name).toBe("Uncategorized");
  });

  it("Should return an error if an invalid query string is provided", async () => {
    const response = await request(app)
      .get("/templates?invalid=query")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(400);
  });

  it("Should return the full list of templates if an invalid filter is provided", async () => {
    const response = await request(app)
      .get("/templates?filterBy[invalid]=123")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);
  });

  it("Should filter templates by category if provided", async () => {
    const response = await request(app)
      .get("/templates?filterBy[category_id]=123")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it("Should return an empty array of templates if the are no templates matching the category value", async () => {
    const response = await request(app)
      .get("/templates?filterBy[category_id]=999")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });

  it("Should filter templates by device type if provided", async () => {
    const response = await request(app)
      .get("/templates?filterBy[device_type]=webapp")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2);
  });

  it("Should return an empty array of templates if the are no templates matching the deviceType value", async () => {
    const response = await request(app)
      .get("/templates?filterBy[device_type]=smarttv")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });

  it("Should filter templates by locale if provided", async () => {
    const response = await request(app)
      .get("/templates?filterBy[locale]=it")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it("Should return an empty array of templates if the are no templates matching the locale value", async () => {
    const response = await request(app)
      .get("/templates?filterBy[locale]=es")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });

  it("Should filter templates by requiresLogin if provided", async () => {
    const response = await request(app)
      .get("/templates?filterBy[requires_login]=1")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
  });

  it("Should return an empty array of templates if the are no templates matching the requiresLogin value", async () => {
    const response = await request(app)
      .get("/templates?filterBy[requires_login]=123")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
  });

  it("Should return templates ordered by 'id' if orderBy is provided", async () => {
    const response = await request(app)
      .get("/templates?orderBy=id")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body[0].id).toBe(1);
  });

  it("Should return templates ordered by desc 'id' if orderBy and order are provided", async () => {
    const response = await request(app)
      .get("/templates?orderBy=id&order=desc")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body[0].id).toBe(3);
  });

  it("Should return templates ordered by 'title' if orderBy is provided", async () => {
    const response = await request(app)
      .get("/templates?orderBy=title")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body[0].title).toBe("Template 1");
  });

  it("Should return templates ordered by desc 'title' if orderBy and order are provided", async () => {
    const response = await request(app)
      .get("/templates?orderBy=title&order=desc")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body[0].title).toBe("Template 3");
  });

  it("Should return templates ordered by 'category_id' if orderBy is provided", async () => {
    const response = await request(app)
      .get("/templates?orderBy=category_id")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body[0].category.id).toBe(1);
  });

  it("Should return templates ordered by desc 'category_id' if orderBy and order are provided", async () => {
    const response = await request(app)
      .get("/templates?orderBy=category_id&order=desc")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body[0].category.id).toBe(-1);
  });

  it("Should return templates ordered by 'locale' if orderBy is provided", async () => {
    const response = await request(app)
      .get("/templates?orderBy=locale")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body[0].locale).toBe("en");
  });

  it("Should return templates ordered by desc 'locale' if orderBy and order are provided", async () => {
    const response = await request(app)
      .get("/templates?orderBy=locale&order=DESC")
      .set("authorization", "Bearer customer");
    expect(response.status).toBe(200);
    expect(response.body[0].locale).toBe("it");
  });
});
