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
describe("With draft only", () => {
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
    await tryber.tables.UxCampaignInsights.do().insert([
      {
        id: 1,
        campaign_id: 1,
        version: 1,
        title: "Finding cluster all",
        description: "Finding description",
        severity_id: 1,
        cluster_ids: "0",
        order: 2,
        finding_id: 10,
        enabled: 1,
      },
      {
        id: 2,
        campaign_id: 1,
        version: 1,
        title: "Finding cluster 1",
        description: "Finding description",
        severity_id: 2,
        cluster_ids: "1",
        order: 1,
        finding_id: 11,
        enabled: 1,
      },
      {
        id: 3,
        campaign_id: 1,
        version: 1,
        title: "Finding cluster 1,2",
        description: "Finding description",
        severity_id: 2,
        cluster_ids: "1,2",
        order: 1,
        finding_id: 12,
        enabled: 1,
      },
      {
        id: 4,
        campaign_id: 1,
        version: 1,
        title: "Finding disabled",
        description: "Finding description",
        severity_id: 3,
        cluster_ids: "0",
        order: 0,
        finding_id: 13,
        enabled: 0,
      },
      {
        id: 5,
        campaign_id: 1,
        version: 1,
        title: "Finding deleted cluster",
        description: "Insight description",
        severity_id: 3,
        cluster_ids: "3",
        order: 0,
        finding_id: 14,
        enabled: 1,
      },
      {
        id: 6,
        campaign_id: 1,
        version: 1,
        title: "Finding mixed clusters 1,3 (3 is deleted)",
        description: "Insight description",
        severity_id: 3,
        cluster_ids: "1,3",
        order: 0,
        finding_id: 15,
        enabled: 1,
      },
      {
        id: 7,
        campaign_id: 2,
        version: 1,
        title: "Finding other cp",
        description: "Insight description",
        severity_id: 3,
        cluster_ids: "0",
        order: 0,
        finding_id: 16,
        enabled: 1,
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
        version: 1,
        cluster_id: 3, //deleted cluster
        value: 4,
        comment: "Comment 3",
      },
    ]);
    await unguess.tables.UxFindingComments.do().insert([
      {
        id: 1,
        finding_id: 10,
        campaign_id: 1,
        comment: "Comment finding10 - clusters: all",
        profile_id: 1,
      },
      {
        id: 2,
        finding_id: 11,
        campaign_id: 1,
        comment: "Comment finding11 - clusters: 1",
        profile_id: 1,
      },
      {
        id: 3,
        finding_id: 12,
        campaign_id: 1,
        comment: "Comment finding12 - clusters: 1,2",
        profile_id: 1,
      },
      {
        id: 4,
        finding_id: 14, //deleted cluster - cluster 3
        campaign_id: 1,
        comment: "Comment finding14 - clusters: 3 - deleted cluster",
        profile_id: 1,
      },
    ]);
  });
  afterAll(async () => {
    await tryber.tables.WpAppqEvdCampaign.do().delete();
    await tryber.tables.WpAppqUserToCampaign.do().delete();
    await tryber.tables.WpAppqProject.do().delete();
    await tryber.tables.WpAppqCustomer.do().delete();
    await tryber.tables.WpAppqUsecaseCluster.do().delete();
    await tryber.tables.UxCampaignData.do().delete();
    await tryber.tables.UxCampaignInsights.do().delete();
    await tryber.tables.UxCampaignSentiments.do().delete();
    await unguess.tables.UxFindingComments.do().delete();
  });

  it("Should not return findings of a deleted clusters", async () => {
    const response = await request(app)
      .get(`/campaigns/1/ux`)
      .set("Authorization", "Bearer admin");

    expect(response.body.findings.length).toEqual(4);

    expect(response.body.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 10,
        }),
        expect.objectContaining({
          id: 11,
        }),
        expect.objectContaining({
          id: 12,
        }),
        expect.objectContaining({
          id: 15,
        }),
      ])
    );
  });

  it("Should remove deleted cluster on returning findings", async () => {
    const response = await request(app)
      .get(`/campaigns/1/ux`)
      .set("Authorization", "Bearer admin");

    expect(response.body.findings.length).toEqual(4);
    expect(response.body.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 10,
        }),
        expect.objectContaining({
          id: 11,
        }),
        expect.objectContaining({
          id: 12,
        }),
        expect.objectContaining({
          id: 15,
          clusters: [1],
        }),
      ])
    );
  });

  it("Should return the sentiments if exist the cluster", async () => {
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
        expect.not.objectContaining({
          cluster: {
            id: 2,
            name: "Cluster 3",
          },
          value: 4,
          comment: "Comment 3",
        }),
      ])
    );
  });

  it("Should not return comments of deleted cluster", async () => {
    const response = await request(app)
      .get(`/campaigns/1/ux`)
      .set("Authorization", "Bearer admin");

    expect(response.status).toBe(200);
    const comments = response.body.findings
      .map((f: { comment: string }) => f.comment)
      .filter((c: string) => c !== undefined); //comment shoould be undefined if not exist

    expect(comments).toHaveLength(3);

    expect(comments).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Comment finding10 - clusters: all"),
        expect.stringContaining("Comment finding11 - clusters: 1"),
        expect.stringContaining("Comment finding12 - clusters: 1,2"),
        expect.not.stringContaining(
          "Comment finding14 - clusters: 3 - deleted cluster"
        ),
      ])
    );
  });
});
