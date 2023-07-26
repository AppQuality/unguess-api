import app from "@src/app";
import { tryber } from "@src/features/database";
import request from "supertest";

const campaign = {
  platform_id: 1,
  pm_id: 1,
  page_preview_id: 1,
  page_manual_id: 1,
  start_date: "2021-01-01",
  end_date: "2021-01-01",
  close_date: "2021-01-01",
  title: "Campaign 1",
  customer_title: "Customer 1",
  customer_id: 1,
  project_id: 1,
};
describe("GET /campaigns/:campaignId/ux", () => {
  beforeAll(async () => {
    await tryber.tables.WpAppqEvdCampaign.do().insert([
      {
        ...campaign,
        id: 1,
      },
      {
        ...campaign,
        id: 2,
      },
    ]);
    await tryber.tables.WpAppqUserToCampaign.do().insert([
      {
        wp_user_id: 1,
        campaign_id: 1,
      },
    ]);
    await tryber.tables.WpAppqProject.do().insert([
      {
        id: 1,
        display_name: "Project 1",
        customer_id: 1,
        edited_by: 1,
      },
    ]);
    await tryber.tables.WpAppqCustomer.do().insert([
      {
        id: 1,
        company: "Customer 1",
        pm_id: 1,
      },
    ]);
    await tryber.tables.WpAppqUsecaseCluster.do().insert([
      {
        id: 1,
        campaign_id: 1,
        title: "Cluster 1",
        subtitle: "",
      },
      {
        id: 2,
        campaign_id: 1,
        title: "Cluster 2",
        subtitle: "",
      },
    ]);
  });
  afterAll(async () => {
    await tryber.tables.WpAppqEvdCampaign.do().delete();
    await tryber.tables.WpAppqUserToCampaign.do().delete();
    await tryber.tables.WpAppqProject.do().delete();
    await tryber.tables.WpAppqCustomer.do().delete();
  });

  describe("Permissions", () => {
    beforeAll(async () => {
      await tryber.tables.UxCampaignData.do().insert([
        {
          campaign_id: 1,
          version: 1,
          published: 1,
        },
      ]);
    });
    afterAll(async () => {
      await tryber.tables.UxCampaignData.do().delete();
    });
    // It should answer 403 if user is not logged in
    it("Should answer 403 if user is not logged in", async () => {
      const response = await request(app).get(`/campaigns/1/ux`);
      expect(response.status).toBe(403);
    });

    // It should answer 400 if campaign does not exist
    it("Should answer 400 if campaign does not exist", async () => {
      const response = await request(app)
        .get(`/campaigns/999999/ux`)
        .set("Authorization", "Bearer user");
      expect(response.status).toBe(400);
    });

    // It should answer 403 if the campaign exists but the user has no permissions to see the campaign
    it("Should answer 403 if the campaign exists but the user has no permissions to see the campaign", async () => {
      const response = await request(app)
        .get(`/campaigns/2/ux`)
        .set("Authorization", "Bearer user");

      expect(response.status).toBe(403);
    });

    // It should answer 200 with the campaign if the user is an admin
    it("Should answer 200 with the campaign if the user is an admin", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer admin");

      expect(response.status).toBe(200);
    });

    // Should answer 200 with the campaign if the user has specific permission to see the campaign
    it("Should answer 200 with the campaign if the user has specific permission to see the campaign", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer user");
      expect(response.status).toBe(200);
    });
  });

  describe("Without data", () => {
    it("Should answer 404", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer user");
      expect(response.status).toBe(404);
    });
  });

  describe("With draft only", () => {
    beforeAll(async () => {
      await tryber.tables.UxCampaignData.do().insert([
        {
          campaign_id: 1,
          version: 1,
          published: 0,
        },
      ]);
      await tryber.tables.UxCampaignData.do().insert([
        {
          campaign_id: 1,
          version: 2,
          published: 0,
        },
      ]);
      await tryber.tables.UxCampaignInsights.do().insert([
        {
          campaign_id: 1,
          version: 1,
          title: "First version",
          description: "",
          severity_id: 1,
          cluster_ids: "0",
          order: 1,
        },
        {
          campaign_id: 1,
          version: 2,
          title: "My second insight",
          description: "Second insight description",
          severity_id: 1,
          cluster_ids: "1,2",
          order: 1,
        },
        {
          campaign_id: 1,
          version: 2,
          title: "My insight",
          description: "Insight description",
          severity_id: 1,
          cluster_ids: "0",
          order: 0,
        },
      ]);
    });
    afterAll(async () => {
      await tryber.tables.UxCampaignData.do().delete();
      await tryber.tables.UxCampaignInsights.do().delete();
    });
    it("Should answer 200 for admin", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer admin");
      console.log(response.body);
      expect(response.status).toBe(200);
    });
    it("Should answer 404 for admin if showAsCustomer is set", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux?showAsCustomer=true`)
        .set("Authorization", "Bearer admin");
      expect(response.status).toBe(404);
    });
    it("Should answer 404 for non-admin", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer user");
      expect(response.status).toBe(404);
    });

    it("Should return the findings for last draft", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer admin");
      expect(response.body).toHaveProperty("findings");
      expect(response.body.findings).toHaveLength(2);
      expect(response.body.findings[0]).toEqual(
        expect.objectContaining({
          title: "My insight",
          description: "Insight description",
          severity: { id: 1, name: "Minor" },
          cluster: "all",
        })
      );
      expect(response.body.findings[1]).toEqual(
        expect.objectContaining({
          title: "My second insight",
          description: "Second insight description",
          severity: { id: 1, name: "Minor" },
          cluster: [
            {
              id: 1,
              name: "Cluster 1",
            },
            {
              id: 2,
              name: "Cluster 2",
            },
          ],
        })
      );
    });
  });

  describe("With a published version", () => {
    beforeAll(async () => {
      await tryber.tables.UxCampaignData.do().insert([
        {
          campaign_id: 1,
          version: 1,
          published: 1,
        },
      ]);
      await tryber.tables.UxCampaignData.do().insert([
        {
          campaign_id: 1,
          version: 2,
          published: 0,
        },
      ]);
      await tryber.tables.UxCampaignInsights.do().insert([
        {
          campaign_id: 1,
          version: 1,
          title: "First version",
          description: "",
          severity_id: 1,
          cluster_ids: "0",
          order: 1,
        },
        {
          campaign_id: 1,
          version: 2,
          title: "My second insight",
          description: "Second insight description",
          severity_id: 1,
          cluster_ids: "1,2",
          order: 1,
        },
        {
          campaign_id: 1,
          version: 2,
          title: "My insight",
          description: "Insight description",
          severity_id: 1,
          cluster_ids: "0",
          order: 0,
        },
      ]);
    });
    it("Should answer 200 for admin", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer admin");
      expect(response.status).toBe(200);
    });
    it("Should answer 200 for non-admin", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer user");
      expect(response.status).toBe(200);
    });

    it("Should answer with published version insights for admin with showAsCustomer", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux?showAsCustomer=true`)
        .set("Authorization", "Bearer admin");
      expect(response.status).toBe(200);
      expect(response.body.findings).toHaveLength(1);
      expect(response.body.findings[0]).toEqual(
        expect.objectContaining({
          title: "First version",
          description: "",
          severity: { id: 1, name: "Minor" },
          cluster: "all",
        })
      );
    });
    it("Should answer with published version insights for non-admin", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer user");
      expect(response.status).toBe(200);
      expect(response.body.findings).toHaveLength(1);
      expect(response.body.findings[0]).toEqual(
        expect.objectContaining({
          title: "First version",
          description: "",
          severity: { id: 1, name: "Minor" },
          cluster: "all",
        })
      );
    });

    it("Should return the findings for last draft for admin", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer admin");
      expect(response.body).toHaveProperty("findings");
      expect(response.body.findings).toHaveLength(2);
      expect(response.body.findings[0]).toEqual(
        expect.objectContaining({
          title: "My insight",
          description: "Insight description",
          severity: { id: 1, name: "Minor" },
          cluster: "all",
        })
      );
      expect(response.body.findings[1]).toEqual(
        expect.objectContaining({
          title: "My second insight",
          description: "Second insight description",
          severity: { id: 1, name: "Minor" },
          cluster: [
            {
              id: 1,
              name: "Cluster 1",
            },
            {
              id: 2,
              name: "Cluster 2",
            },
          ],
        })
      );
    });
  });
});
