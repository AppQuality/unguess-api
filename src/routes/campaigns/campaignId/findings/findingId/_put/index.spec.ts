import app from "@src/app";
import { tryber, unguess } from "@src/features/database";
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

describe("PUT /campaigns/:campaignId/findings/:findingId", () => {
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
    await tryber.tables.UxCampaignInsights.do().insert([
      {
        id: 1,
        campaign_id: 1,
        version: 3,
        title: "Finding title",
        description: "Finding description",
        severity_id: 1,
        cluster_ids: "all",
        order: 1,
        finding_id: 10,
        enabled: 1,
      },
      {
        id: 2,
        campaign_id: 1,
        version: 3,
        title: "Finding disabled",
        description: "Finding description",
        severity_id: 1,
        cluster_ids: "all",
        order: 1,
        finding_id: 11,
        enabled: 0,
      },
      {
        id: 3,
        campaign_id: 1,
        version: 3,
        title: "Finding disabled",
        description: "Finding description",
        severity_id: 1,
        cluster_ids: "all",
        order: 1,
        finding_id: 12,
        enabled: 1,
      },
    ]);
    await tryber.tables.UxCampaignInsights.do().insert([
      {
        id: 5,
        campaign_id: 1,
        version: 4,
        title: "Finding title",
        description: "Finding description",
        severity_id: 1,
        cluster_ids: "all",
        order: 1,
        finding_id: 10,
        enabled: 1,
      },
      {
        id: 6,
        campaign_id: 1,
        version: 4,
        title: "Finding disabled",
        description: "Finding description",
        severity_id: 1,
        cluster_ids: "all",
        order: 1,
        finding_id: 11,
        enabled: 0,
      },
      {
        id: 7,
        campaign_id: 1,
        version: 4,
        title: "Finding disabled",
        description: "Finding description",
        severity_id: 1,
        cluster_ids: "all",
        order: 1,
        finding_id: 12,
        enabled: 0,
      },
    ]);
  });

  afterAll(async () => {
    await tryber.tables.WpAppqEvdCampaign.do().delete();
    await tryber.tables.WpAppqUserToCampaign.do().delete();
    await tryber.tables.WpAppqProject.do().delete();
    await tryber.tables.WpAppqCustomer.do().delete();
    await tryber.tables.UxCampaignInsights.do().delete();
  });

  afterEach(async () => {
    await unguess.tables.UxFindingComments.do().delete();
  });

  describe("Permissions", () => {
    beforeAll(async () => {
      await tryber.tables.UxCampaignData.do().insert([
        {
          campaign_id: 1,
          version: 3,
          published: 1,
        },
      ]);

      await tryber.tables.UxCampaignData.do().insert([
        {
          campaign_id: 1,
          version: 4,
          published: 0,
        },
      ]);
    });
    afterAll(async () => {
      await tryber.tables.UxCampaignData.do().delete();
    });
    // It should answer 403 if user is not logged in
    it("Should answer 403 if user is not logged in", async () => {
      const response = await request(app).put(`/campaigns/1/findings/1`);
      expect(response.status).toBe(403);
    });

    // // It should answer 400 if campaign does not exist
    it("Should answer 400 if campaign does not exist", async () => {
      const response = await request(app)
        .put(`/campaigns/999999/findings/1`)
        .send({ comment: "test" })
        .set("Authorization", "Bearer user");
      expect(response.status).toBe(400);
    });

    // // It should answer 404 if finding does not exist
    it("Should answer 404 if finding does not exist", async () => {
      const response = await request(app)
        .put(`/campaigns/1/findings/999999`)
        .send({ comment: "test" })
        .set("Authorization", "Bearer user");
      expect(response.status).toBe(404);
    });

    // It should answer 403 if the campaign exists but the user has no permissions to see the campaign
    it("Should answer 403 if the campaign exists but the user has no permissions to see the campaign", async () => {
      const response = await request(app)
        .put(`/campaigns/2/findings/10`)
        .set("Authorization", "Bearer user")
        .send({ comment: "test" });
      expect(response.status).toBe(403);
    });

    // Should answer 200 with the campaign if the user has specific permission to see the campaign
    it("Should answer 200 with the campaign if the user has specific permission to see the campaign", async () => {
      const response = await request(app)
        .put(`/campaigns/1/findings/10`)
        .set("Authorization", "Bearer user")
        .send({ comment: "test" });
      expect(response.status).toBe(200);
    });

    // Should return 404 if the finding is disabled
    it("Should return 404 if the finding is disabled", async () => {
      const response = await request(app)
        .put(`/campaigns/1/findings/11`)
        .set("Authorization", "Bearer user")
        .send({ comment: "test" });
      expect(response.status).toBe(404);
    });

    //Should insert a comment with correct data
    it("Should insert a comment with correct data", async () => {
      const comments = await unguess.tables.UxFindingComments.do()
        .select()
        .where({ campaign_id: 1 })
        .where({ finding_id: 10 });
      expect(comments).toHaveLength(0);

      const response = await request(app)
        .put(`/campaigns/1/findings/10`)
        .set("Authorization", "Bearer user")
        .send({ comment: "Customer comment" });
      expect(response.status).toBe(200);

      const newComments = await unguess.tables.UxFindingComments.do()
        .select()
        .where({ campaign_id: 1 })
        .where({ finding_id: 10 });
      expect(newComments).toHaveLength(1);
      expect(newComments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            campaign_id: 1,
            finding_id: 10,
            profile_id: 1,
            comment: "Customer comment",
          }),
        ])
      );
    });

    it("Should be able to update an insight note even if the insight is deleted in the draft version", async () => {
      const response = await request(app)
        .put(`/campaigns/1/findings/12`)
        .set("Authorization", "Bearer admin")
        .send({ comment: "Test comment" });
      expect(response.status).toBe(200);
    });

    //Should update the comment if it already exists for that finding
    it("Should update the comment if it already exists for that finding", async () => {
      await unguess.tables.UxFindingComments.do().insert({
        campaign_id: 1,
        finding_id: 12,
        profile_id: 1,
        comment: "Customer comment",
      });
      const comments = await unguess.tables.UxFindingComments.do()
        .select()
        .where({ campaign_id: 1 })
        .where({ finding_id: 12 });

      expect(comments).toHaveLength(1);

      const response = await request(app)
        .put(`/campaigns/1/findings/12`)
        .set("Authorization", "Bearer user")
        .send({ comment: "Customer updated comment" });
      expect(response.status).toBe(200);

      const updatedComments = await unguess.tables.UxFindingComments.do()
        .select()
        .where({ campaign_id: 1 })
        .where({ finding_id: 12 });
      expect(updatedComments).toHaveLength(1);

      expect(comments[0].comment).not.toEqual(updatedComments[0].comment);

      expect(updatedComments).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            campaign_id: 1,
            finding_id: 12,
            profile_id: 1,
            comment: "Customer updated comment",
          }),
        ])
      );
    });

    it("Should answer 200 with the finding comment even if there are other old version published", async () => {
      await tryber.tables.UxCampaignData.do().insert([
        {
          campaign_id: 1,
          version: 1,
          published: 1,
        },
        {
          campaign_id: 1,
          version: 2,
          published: 1,
        },
      ]);

      const response = await request(app)
        .put(`/campaigns/1/findings/10`)
        .set("Authorization", "Bearer user")
        .send({ comment: "test" });
      expect(response.status).toBe(200);
    });
  }); //End of describe("Permissions")
});
