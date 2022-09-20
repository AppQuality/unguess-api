import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { table as platformTable } from "@src/__mocks__/database/platforms";

const customer_1 = {
  id: 999,
  company: "Company 999",
  company_logo: "logo999.png",
  tokens: 100,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 999,
};

const project_1 = {
  id: 999,
  display_name: "Project 999",
  customer_id: 999,
};

const project_2 = {
  id: 998,
  display_name: "Project 998",
  customer_id: 10,
};

const user_to_project_1 = {
  wp_user_id: 1,
  project_id: 999,
};

const campaign_type_1 = {
  id: 999,
  name: "Functional Testing (Bug Hunting)",
  type: 0,
};

const campaign_1 = {
  id: 1,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 2 title",
  customer_title: "Campaign 2 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: project_1.id,
};

const campaign_2 = {
  id: 2,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 998 title",
  customer_title: "Campaign 998 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: project_2.id,
};

const campaign_patch_request = {
  customer_title: "Campaign 999 customer title PATCHED",
};

describe("PATCH /campaigns", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.create();
        await platformTable.create();

        await dbAdapter.add({
          companies: [customer_1],
          userToCustomers: [user_to_customer_1],
          projects: [project_1, project_2],
          userToProjects: [user_to_project_1],
          campaignTypes: [campaign_type_1],
          campaigns: [campaign_1, campaign_2],
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
        await dbAdapter.drop();
        await platformTable.drop();
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  // It should answer 403 if user is not logged in
  it("should answer 403 if user is not logged in", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}`)
      .send(campaign_patch_request);

    expect(response.status).toBe(403);
  });

  // It should return 200 with the updated campaign
  it("Should return 200 with the updated campaign", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}`)
      .set("Authorization", "Bearer customer")
      .send({
        customer_title: campaign_patch_request.customer_title,
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: campaign_1.id,
        customer_title: campaign_patch_request.customer_title,
      })
    );
  });

  // It should fail if the customer_title is an empty string
  it("Should fail if the customer_title is an empty string", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}`)
      .set("Authorization", `Bearer customer`)
      .send({
        customer_title: "",
      });

    expect(response.status).toBe(400);
  });

  // It should execute correctly if the customer_title contains a single quote (or more)
  it("Should execute correctly if the customer_title contains a single quote (or more)", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}`)
      .set("Authorization", `Bearer customer`)
      .send({
        customer_title: campaign_1.customer_title + " 'PATCHED'",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: campaign_1.id,
        customer_title: campaign_1.customer_title + " 'PATCHED'",
      })
    );
  });

  // It should execute correctly if the customer_title contains a double quote (or more)
  it("Should execute correctly if the customer_title contains a double quote (or more)", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}`)
      .set("Authorization", `Bearer customer`)
      .send({
        customer_title: campaign_1.customer_title + ' "PATCHED"',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: campaign_1.id,
        customer_title: campaign_1.customer_title + " 'PATCHED'",
      })
    );
  });

  // It should execute correctly if the customer_title contains a backslash (or more)
  it("Should execute correctly if the customer_title contains a backslash (or more)", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}`)
      .set("Authorization", `Bearer customer`)
      .send({
        customer_title: campaign_1.customer_title + " PATCHED\\",
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        id: campaign_1.id,
        customer_title: campaign_1.customer_title + " PATCHED\\",
      })
    );
  });

  // It should execute correctly if the customer_title contains a comma (or more)
  it("Should execute correctly if the customer_title contains a comma (or more)", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}`)
      .set("Authorization", `Bearer customer`)
      .send({
        customer_title: campaign_1.customer_title + ", PATCHED",
      });

    expect(response.status).toBe(200);
  });

  // It should fail if the campaign does not exist
  it("Should fail if the campaign does not exist", async () => {
    const response = await request(app)
      .patch(`/campaigns/9999999`)
      .set("Authorization", `Bearer customer`)
      .send({
        customer_title: campaign_patch_request.customer_title,
      });

    expect(response.status).toBe(400);
  });

  // It should fail if the user has no permission to see the campaign's project
  it("Should fail if the user has no permission to see the campaign's project", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_2.id}`)
      .set("Authorization", `Bearer customer`)
      .send({
        customer_title: campaign_2.customer_title + " PATCHED",
      });

    expect(response.status).toBe(403);
  });

  // It should fail if the customer_title is too long
  it("Should fail if the customer_title is too long", async () => {
    const response = await request(app)
      .patch(`/campaigns/${campaign_1.id}`)
      .set("Authorization", `Bearer customer`)
      .send({
        customer_title: "a".repeat(257), // varchar(256)
      });

    expect(response.status).toBe(400);
  });
});
