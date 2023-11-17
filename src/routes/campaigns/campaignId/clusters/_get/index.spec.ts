import request from "supertest";
import app from "@src/app";
import { tryber } from "@src/features/database";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";

const customer_1 = {
  id: 10,
  company: "Company 10",
  company_logo: "logo10.png",
  tokens: 100,
  pm_id: 1,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: customer_1.id,
};

const project_1 = {
  id: 1,
  display_name: "Project 1",
  customer_id: customer_1.id,
  edited_by: 1,
};

const user_to_project_1 = {
  wp_user_id: 1,
  project_id: 1,
};

const campaign_type_1 = {
  id: 999,
  name: "Functional Testing (Bug Hunting)",
  type: FUNCTIONAL_CAMPAIGN_TYPE_ID,
  category_id: 1,
};

const campaign_1 = {
  id: 1,
  platform_id: 1,
  start_date: "2020-01-01",
  end_date: "2020-01-01",
  title: "This is the title",
  page_preview_id: 1,
  page_manual_id: 1,
  customer_id: 1,
  pm_id: 1,
  project_id: 1,
  customer_title: "",
  campaign_pts: 200,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
};

const campaign_2 = {
  id: 2,
  platform_id: 1,
  start_date: "2020-01-01",
  end_date: "2020-01-01",
  title: "This is the title",
  page_preview_id: 1,
  page_manual_id: 1,
  customer_id: 15,
  pm_id: 1,
  project_id: 22,
  customer_title: "",
  campaign_pts: 200,
};

const user_to_campaign_1 = {
  wp_user_id: 1,
  campaign_id: 1,
};

const cluster_1 = {
  id: 10,
  campaign_id: 1,
  title: "Cluster10 title",
  subtitle: "Cluster10 subtitle",
};
const cluster_2 = {
  id: 20,
  campaign_id: 2,
  title: "Cluster20 title",
  subtitle: "Cluster20 subtitle",
};

describe("GET /campaigns/{cid}/clusters", () => {
  beforeAll(async () => {
    await tryber.tables.WpAppqCustomer.do().insert([customer_1]);
    await tryber.tables.WpAppqUserToCustomer.do().insert([user_to_customer_1]);
    await tryber.tables.WpAppqProject.do().insert([project_1]);
    await tryber.tables.WpAppqUserToProject.do().insert([user_to_project_1]);
    await tryber.tables.WpAppqCampaignType.do().insert([campaign_type_1]);
    await tryber.tables.WpAppqEvdCampaign.do().insert([campaign_1, campaign_2]);
    await tryber.tables.WpAppqUserToCampaign.do().insert([user_to_campaign_1]);
    await tryber.tables.UxCampaignData.do().insert([
      {
        campaign_id: campaign_1.id,
        version: 1,
        published: 1,
      },
    ]);
    await tryber.tables.WpAppqUsecaseCluster.do().insert([
      cluster_1,
      cluster_2,
    ]);
  });
  afterAll(async () => {
    await tryber.tables.WpAppqCustomer.do().delete();
    await tryber.tables.WpAppqUserToCustomer.do().delete();
    await tryber.tables.WpAppqProject.do().delete();
    await tryber.tables.WpAppqUserToProject.do().delete();
    await tryber.tables.WpAppqCampaignType.do().delete();
    await tryber.tables.WpAppqEvdCampaign.do().delete();
    await tryber.tables.WpAppqUserToCampaign.do().delete();
    await tryber.tables.UxCampaignData.do().delete();
    await tryber.tables.WpAppqUsecaseCluster.do().delete();
  });

  it("Should return 400 if campaign does not exist", async () => {
    const response = await request(app)
      .get("/campaigns/999/clusters")
      .set("Authorization", "Bearer admin");
    expect(response.status).toBe(400);
  });
  it("Should return 403 if the user does not have permission", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/clusters`)
      .set("Authorization", "Bearer tester");
    expect(response.status).toBe(403);
  });

  it("Should return 200 if the user has permission ", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/clusters`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should return 200 if the user is admin", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/clusters`)
      .set("Authorization", "Bearer admin");
    expect(response.status).toBe(200);
  });

  it("Should not be able to fetch clusters from a campain the user does not have access to", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_2.id}/clusters`)
      .set("Authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  it("Should return items array", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/clusters`)
      .set("Authorization", "Bearer user");
    expect(response.body).toHaveProperty("items");
    expect(response.body.items).toBeInstanceOf(Array);
  });

  it("Should return clusters of a specific campaign", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/clusters`)
      .set("Authorization", "Bearer user");
    expect(response.body.items.length).toBe(1);
  });

  it("Should return items with id as number", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/clusters`)
      .set("Authorization", "Bearer user");
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
        }),
      ])
    );
  });
  it("Should return items with id", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/clusters`)
      .set("Authorization", "Bearer user");
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 10,
        }),
      ])
    );
  });
  it("Should return items with name as string", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/clusters`)
      .set("Authorization", "Bearer user");
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: expect.any(String),
        }),
      ])
    );
  });
  it("Should return items with name", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/clusters`)
      .set("Authorization", "Bearer user");
    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Cluster10 title",
        }),
      ])
    );
  });
  describe("GET /campaigns/:{cid}/clusters - there are no clusters", () => {
    beforeAll(async () => {
      await tryber.tables.WpAppqUsecaseCluster.do().delete();
    });
    it("Should return items array", async () => {
      const response = await request(app)
        .get(`/campaigns/${campaign_1.id}/clusters`)
        .set("Authorization", "Bearer user");
      expect(response.body).toHaveProperty("items");
      expect(response.body.items).toBeInstanceOf(Array);
    });

    it("Should return items as empty array if there are no clusters", async () => {
      const response = await request(app)
        .get(`/campaigns/${campaign_1.id}/clusters`)
        .set("Authorization", "Bearer user");
      expect(response.body).toHaveProperty("items");
      expect(response.body.items).toEqual([]);
    });
  });
});
