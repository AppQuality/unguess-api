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
          methodology_description: "Methodology description",
          methodology_type: "qualitative",
          goal: "Goal",
          users: 10,
        },
      ]);

      await tryber.tables.UxCampaignQuestions.do().insert([
        {
          id: 1,
          campaign_id: 1,
          question: "Question 1",
          version: 1,
        },
        {
          id: 2,
          campaign_id: 1,
          question: "Question 2",
          version: 1,
        },
      ]);

      await tryber.tables.UxCampaignFindings.do().insert([
        {
          id: 1,
          campaign_id: 1,
          version: 1,
          title: "First version",
          description: "",
          severity_id: 1,
          cluster_ids: "0",
          order: 2,
        },
        {
          id: 2,
          campaign_id: 1,
          version: 1,
          title: "My second insight",
          description: "Second insight description",
          severity_id: 2,
          cluster_ids: "1,2",
          order: 1,
        },
        {
          id: 3,
          campaign_id: 1,
          version: 1,
          title: "My insight",
          description: "Insight description",
          severity_id: 3,
          cluster_ids: "0",
          order: 0,
        },
      ]);
      await tryber.tables.UxCampaignVideoParts.do().insert([
        {
          insight_id: 1,
          media_id: 1,
          start: 0,
          end: 0,
          description: "First version",
        },
        {
          insight_id: 2,
          media_id: 1,
          start: 5,
          end: 10,
          description: "Description",
        },
      ]);
      await tryber.tables.WpAppqUserTaskMedia.do().insert([
        {
          id: 1,
          location:
            "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          campaign_task_id: 1,
          user_task_id: 1,
          tester_id: 1,
        },
      ]);
      await tryber.tables.UxCampaignSentiments.do().insert([
        {
          campaign_id: 1,
          version: 1,
          cluster_id: 1,
          value: 1,
          comment: "Comment 1",
        },
        {
          campaign_id: 1,
          version: 1,
          cluster_id: 2,
          value: 5,
          comment: "Comment 2",
        },
      ]);
    });
    afterAll(async () => {
      await tryber.tables.UxCampaignData.do().delete();
      await tryber.tables.UxCampaignFindings.do().delete();
      await tryber.tables.UxCampaignVideoParts.do().delete();
      await tryber.tables.WpAppqUserTaskMedia.do().delete();
      await tryber.tables.UxCampaignQuestions.do().delete();
      await tryber.tables.UxCampaignSentiments.do().delete();
    });
    it("Should answer 200 for admin", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer admin");
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
      expect(response.body.findings).toHaveLength(3);

      expect(response.body.findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: "First version",
            description: "",
            severity: { id: 1, name: "Minor" },
            cluster: "all",
          }),
          expect.objectContaining({
            title: "My second insight",
            description: "Second insight description",
            severity: { id: 2, name: "Major" },
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
          }),
          expect.objectContaining({
            title: "My insight",
            description: "Insight description",
            severity: { id: 3, name: "Positive" },
            cluster: "all",
          }),
        ])
      );
    });

    it("Should return the videoparts for last draft", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer admin");
      expect(response.body).toHaveProperty("findings");
      expect(response.body.findings).toHaveLength(3);
      expect(response.body.findings[0]).toHaveProperty("video");
      expect(response.body.findings[1]).toHaveProperty("video");
      expect(response.body.findings[0].video).toHaveLength(0);
      expect(response.body.findings[1].video).toHaveLength(1);
      expect(response.body.findings[1].video[0]).toEqual(
        expect.objectContaining({
          url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          streamUrl: "",
          start: 5,
          end: 10,
          description: "Description",
        })
      );
    });

    it("Should always return methodology, questions, goal and number of users", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer admin");

      expect(response.status).toBe(200);

      expect(response.body).toHaveProperty("methodology");
      expect(response.body).toHaveProperty("questions");
      expect(response.body).toHaveProperty("goal");
      expect(response.body).toHaveProperty("users");

      expect(response.body.methodology).toEqual(
        expect.objectContaining({
          description: expect.any(String),
          type: "qualitative",
        })
      );

      expect(response.body.questions.length).toEqual(2);
      expect(response.body.questions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            text: "Question 1",
          }),
          expect.objectContaining({
            text: "Question 2",
          }),
        ])
      );

      expect(response.body.goal).toEqual("Goal");
      expect(response.body.users).toEqual(10);
    });

    it("Should return the sentiment if there is one", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer admin");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("sentiment");
      expect(response.body.sentiment).toHaveLength(2);

      expect(response.body.sentiment).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            cluster: {
              id: 1,
              name: "Cluster 1",
            },
            value: 1,
            comment: "Comment 1",
          }),
          expect.objectContaining({
            cluster: {
              id: 2,
              name: "Cluster 2",
            },
            value: 5,
            comment: "Comment 2",
          }),
        ])
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
          methodology_description: "Methodology description",
          methodology_type: "qualitative",
          goal: "Goal",
          users: 10,
        },
      ]);
      await tryber.tables.UxCampaignData.do().insert([
        {
          campaign_id: 1,
          version: 2,
          published: 0,
          methodology_description: "Methodology description edited",
          methodology_type: "quantitative",
          goal: "Goal updated",
          users: 11,
        },
      ]);
      await tryber.tables.UxCampaignFindings.do().insert([
        {
          id: 1,
          campaign_id: 1,
          version: 1,
          title: "First version",
          description: "",
          severity_id: 1,
          cluster_ids: "0",
          order: 0,
        },
        {
          id: 2,
          campaign_id: 1,
          version: 2,
          title: "My second insight",
          description: "Second insight description",
          severity_id: 1,
          cluster_ids: "1,2",
          order: 1,
        },
        {
          id: 3,
          campaign_id: 1,
          version: 2,
          title: "My insight",
          description: "Insight description",
          severity_id: 1,
          cluster_ids: "0",
          order: 0,
        },
      ]);
      await tryber.tables.UxCampaignQuestions.do().insert([
        {
          id: 1,
          campaign_id: 1,
          question: "Question 1",
          version: 1,
        },
        {
          id: 2,
          campaign_id: 1,
          question: "Question 2",
          version: 1,
        },
        {
          id: 3,
          campaign_id: 1,
          question: "Question 1",
          version: 2,
        },
        {
          id: 4,
          campaign_id: 1,
          question: "Question 2 edited",
          version: 2,
        },
      ]);
      await tryber.tables.UxCampaignVideoParts.do().insert([
        {
          insight_id: 1,
          media_id: 1,
          start: 0,
          end: 0,
          description: "First version",
        },
        {
          insight_id: 2,
          media_id: 1,
          start: 5,
          end: 10,
          description: "Description",
        },
      ]);
      await tryber.tables.WpAppqUserTaskMedia.do().insert([
        {
          id: 1,
          location:
            "https://s3-eu-west-1.amazonaws.com/appq.use-case-media/CP3461/UC8794/T19095/ebf00412a1bc3fd33fddd52962cf80e6853a10d5_1625090207.mp4",
          campaign_task_id: 1,
          user_task_id: 1,
          tester_id: 1,
        },
      ]);
      await tryber.tables.UxCampaignSentiments.do().insert([
        {
          campaign_id: 1,
          version: 1,
          cluster_id: 1,
          value: 1,
          comment: "Comment 1",
        },
        {
          campaign_id: 1,
          version: 1,
          cluster_id: 2,
          value: 5,
          comment: "Comment 2",
        },
        {
          campaign_id: 1,
          version: 2,
          cluster_id: 1,
          value: 2,
          comment: "Comment 1 draft-modified",
        },
        {
          campaign_id: 1,
          version: 2,
          cluster_id: 2,
          value: 4,
          comment: "Comment 2 draft-modified",
        },
        {
          campaign_id: 2,
          version: 1,
          cluster_id: 1,
          value: 2,
          comment: "Comment 2 other CP",
        },
      ]);
    });

    afterAll(async () => {
      await tryber.tables.UxCampaignData.do().delete();
      await tryber.tables.UxCampaignFindings.do().delete();
      await tryber.tables.UxCampaignVideoParts.do().delete();
      await tryber.tables.WpAppqUserTaskMedia.do().delete();
      await tryber.tables.UxCampaignQuestions.do().delete();
      await tryber.tables.UxCampaignSentiments.do().delete();
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

    it("Should always return methodology, questions, goal and number of users of published version", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer user");

      expect(response.status).toBe(200);

      expect(response.body).toHaveProperty("methodology");
      expect(response.body).toHaveProperty("questions");
      expect(response.body).toHaveProperty("goal");
      expect(response.body).toHaveProperty("users");

      expect(response.body.methodology).toEqual(
        expect.objectContaining({
          description: expect.any(String),
          type: "qualitative",
        })
      );

      expect(response.body.questions.length).toEqual(2);
      expect(response.body.questions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            text: "Question 1",
          }),
          expect.objectContaining({
            text: "Question 2",
          }),
        ])
      );

      expect(response.body.goal).toEqual("Goal");
      expect(response.body.users).toEqual(10);
    });

    it("Should return the sentiment if there is one of published", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer user");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("sentiment");
      expect(response.body.sentiment).toHaveLength(2);

      expect(response.body.sentiment).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            cluster: {
              id: 1,
              name: "Cluster 1",
            },
            value: 1,
            comment: "Comment 1",
          }),
          expect.objectContaining({
            cluster: {
              id: 2,
              name: "Cluster 2",
            },
            value: 5,
            comment: "Comment 2",
          }),
        ])
      );
    });

    it("Should return the videoparts for last published for non-admin", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer user");
      expect(response.body).toHaveProperty("findings");
      expect(response.body.findings).toHaveLength(1);
      expect(response.body.findings[0]).toHaveProperty("video");
      expect(response.body.findings[0].video).toHaveLength(1);
      expect(response.body.findings[0].video[0]).toEqual(
        expect.objectContaining({
          url: "https://s3-eu-west-1.amazonaws.com/appq.use-case-media/CP3461/UC8794/T19095/ebf00412a1bc3fd33fddd52962cf80e6853a10d5_1625090207.mp4",
          streamUrl: "",
          start: 0,
          end: 0,
          description: "First version",
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

    it("Should return the videoparts for last draft for admin", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer admin");
      expect(response.body).toHaveProperty("findings");
      expect(response.body.findings).toHaveLength(2);
      expect(response.body.findings[1]).toHaveProperty("video");
      expect(response.body.findings[1].video).toHaveLength(1);
      expect(response.body.findings[1].video[0]).toEqual(
        expect.objectContaining({
          url: "https://s3-eu-west-1.amazonaws.com/appq.use-case-media/CP3461/UC8794/T19095/ebf00412a1bc3fd33fddd52962cf80e6853a10d5_1625090207.mp4",
          streamUrl: "",
          start: 5,
          end: 10,
          description: "Description",
        })
      );
    });

    it("Should always return methodology, questions, goal and number of users of last draft", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer admin");

      expect(response.status).toBe(200);

      expect(response.body).toHaveProperty("methodology");
      expect(response.body).toHaveProperty("questions");
      expect(response.body).toHaveProperty("goal");
      expect(response.body).toHaveProperty("users");

      expect(response.body.methodology).toEqual(
        expect.objectContaining({
          description: expect.any(String),
          type: "quantitative",
        })
      );

      expect(response.body.questions.length).toEqual(2);
      expect(response.body.questions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            text: "Question 1",
          }),
          expect.objectContaining({
            text: "Question 2 edited",
          }),
        ])
      );

      expect(response.body.goal).toEqual("Goal updated");
      expect(response.body.users).toEqual(11);
    });

    it("Should return the sentiment if there is one of last draft", async () => {
      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer admin");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("sentiment");
      expect(response.body.sentiment).toHaveLength(2);

      expect(response.body.sentiment).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            cluster: {
              id: 1,
              name: "Cluster 1",
            },
            value: 2,
          }),
          expect.objectContaining({
            cluster: {
              id: 2,
              name: "Cluster 2",
            },
            value: 4,
          }),
        ])
      );
    });

    it("Should return the streamUrl if m3u8 file is found", async () => {
      await tryber.tables.WpAppqUserTaskMedia.do()
        .update({
          location:
            "https://s3.eu-west-1.amazonaws.com/appq.static/ad4fc347f2579800a1920a8be6e181dda0f4b290_1692791543.mp4",
        })
        .where({
          id: 1,
        });

      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer user");
      expect(response.body.findings[0].video).toHaveLength(1);
      expect(response.body.findings[0].video[0]).toEqual(
        expect.objectContaining({
          url: "https://s3.eu-west-1.amazonaws.com/appq.static/ad4fc347f2579800a1920a8be6e181dda0f4b290_1692791543.mp4",
          streamUrl:
            "https://s3.eu-west-1.amazonaws.com/appq.static/ad4fc347f2579800a1920a8be6e181dda0f4b290_1692791543-stream.m3u8",
          start: 0,
          end: 0,
          description: "First version",
        })
      );
    });
  });

  describe("Edge cases with published", () => {
    beforeEach(async () => {
      await tryber.tables.UxCampaignData.do().insert([
        {
          campaign_id: 1,
          version: 1,
          published: 1,
          methodology_description: "Methodology description",
          methodology_type: "qualitative",
          goal: "Goal",
          users: 10,
        },
        {
          campaign_id: 1,
          version: 2,
          published: 0,
          methodology_description: "Methodology description edited",
          methodology_type: "quantitative",
          goal: "Goal updated",
          users: 11,
        },
      ]);
      await tryber.tables.UxCampaignFindings.do().insert([
        {
          id: 1,
          campaign_id: 1,
          version: 1,
          title: "First version",
          description: "",
          severity_id: 1,
          cluster_ids: "0",
          order: 0,
        },
        {
          id: 2,
          campaign_id: 1,
          version: 2,
          title: "My second insight",
          description: "Second insight description",
          severity_id: 1,
          cluster_ids: "1,2",
          order: 1,
        },
        {
          id: 3,
          campaign_id: 1,
          version: 2,
          title: "My insight",
          description: "Insight description",
          severity_id: 1,
          cluster_ids: "0",
          order: 0,
        },
      ]);
      await tryber.tables.UxCampaignQuestions.do().insert([
        {
          id: 1,
          campaign_id: 1,
          question: "Question 1",
          version: 1,
        },
        {
          id: 2,
          campaign_id: 1,
          question: "Question 2",
          version: 1,
        },
        {
          id: 3,
          campaign_id: 1,
          question: "Question 1",
          version: 2,
        },
        {
          id: 4,
          campaign_id: 1,
          question: "Question 2 edited",
          version: 2,
        },
      ]);
      await tryber.tables.UxCampaignVideoParts.do().insert([
        {
          insight_id: 1,
          media_id: 1,
          start: 0,
          end: 0,
          description: "First version",
        },
        {
          insight_id: 2,
          media_id: 1,
          start: 5,
          end: 10,
          description: "Description",
        },
      ]);
      await tryber.tables.WpAppqUserTaskMedia.do().insert([
        {
          id: 1,
          location:
            "https://s3-eu-west-1.amazonaws.com/appq.use-case-media/CP3461/UC8794/T19095/ebf00412a1bc3fd33fddd52962cf80e6853a10d5_1625090207.mp4",
          campaign_task_id: 1,
          user_task_id: 1,
          tester_id: 1,
        },
      ]);
      await tryber.tables.UxCampaignSentiments.do().insert([
        {
          campaign_id: 1,
          version: 1,
          cluster_id: 1,
          value: 1,
          comment: "Comment 1",
        },
        {
          campaign_id: 1,
          version: 1,
          cluster_id: 2,
          value: 5,
          comment: "Comment 2",
        },
        {
          campaign_id: 1,
          version: 2,
          cluster_id: 1,
          value: 2,
          comment: "Comment 1 draft-modified",
        },
        {
          campaign_id: 1,
          version: 2,
          cluster_id: 2,
          value: 4,
          comment: "Comment 2 draft-modified",
        },
      ]);
    });

    afterEach(async () => {
      await tryber.tables.UxCampaignData.do().delete();
      await tryber.tables.UxCampaignFindings.do().delete();
      await tryber.tables.UxCampaignVideoParts.do().delete();
      await tryber.tables.WpAppqUserTaskMedia.do().delete();
      await tryber.tables.UxCampaignQuestions.do().delete();
      await tryber.tables.UxCampaignSentiments.do().delete();
    });

    it("Should raise an error if the insight severity is not known", async () => {
      await tryber.tables.UxCampaignFindings.do()
        .update({
          severity_id: 999,
        })
        .where({
          id: 1,
        });

      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer user");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
      expect(response.body.message).toEqual("Invalid severity id");
    });

    it("Should return maior if severity has id = 2", async () => {
      await tryber.tables.UxCampaignFindings.do()
        .update({
          severity_id: 2,
        })
        .where({
          id: 1,
        });

      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer user");

      expect(response.status).toBe(200);
      expect(response.body.findings[0]).toEqual(
        expect.objectContaining({
          severity: { id: 2, name: "Major" },
        })
      );
    });

    it("Should return Positive if severity has id = 3", async () => {
      await tryber.tables.UxCampaignFindings.do()
        .update({
          severity_id: 3,
        })
        .where({
          id: 1,
        });

      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer user");

      expect(response.status).toBe(200);
      expect(response.body.findings[0]).toEqual(
        expect.objectContaining({
          severity: { id: 3, name: "Positive" },
        })
      );
    });

    it("Should return Observation if severity has id = 4", async () => {
      await tryber.tables.UxCampaignFindings.do()
        .update({
          severity_id: 4,
        })
        .where({
          id: 1,
        });

      const response = await request(app)
        .get(`/campaigns/1/ux`)
        .set("Authorization", "Bearer user");

      expect(response.status).toBe(200);
      expect(response.body.findings[0]).toEqual(
        expect.objectContaining({
          severity: { id: 4, name: "Observation" },
        })
      );
    });
  });
});
