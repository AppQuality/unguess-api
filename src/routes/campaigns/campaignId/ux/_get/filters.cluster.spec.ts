import app from "@src/app";
import { tryber } from "@src/features/database";
import request from "supertest";

const campaign_1 = {
  id: 1,
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

const user_to_campaign_1 = {
  wp_user_id: 1,
  campaign_id: 1,
};
const project_1 = {
  id: 1,
  display_name: "Project 1",
  customer_id: 1,
  edited_by: 1,
};
const customer_1 = {
  id: 1,
  company: "Customer 1",
  pm_id: 1,
};

const cluster_1 = {
  id: 1,
  campaign_id: 1,
  title: "Cluster 1",
  subtitle: "",
};
const cluster_2 = {
  id: 2,
  campaign_id: 1,
  title: "Cluster 2",
  subtitle: "",
};
const cluster_3 = {
  id: 3,
  campaign_id: 1,
  title: "Cluster 3",
  subtitle: "subtitle",
};

const insight = {
  campaign_id: 1,
  version: 1,
  title: "Insight title",
  description: "Insight description",
  severity_id: 1,
  cluster_ids: "1,2",
  order: 1,
  enabled: 1,
};

const campaign_ux_data = {
  campaign_id: 1,
  version: 1,
  published: 1,
};

describe("GET /campaigns/:campaignId/ux", () => {
  beforeAll(async () => {
    await tryber.tables.WpAppqEvdCampaign.do().insert([campaign_1]);
    await tryber.tables.WpAppqUserToCampaign.do().insert([user_to_campaign_1]);
    await tryber.tables.WpAppqProject.do().insert([project_1]);
    await tryber.tables.WpAppqCustomer.do().insert([customer_1]);
    await tryber.tables.WpAppqUsecaseCluster.do().insert([
      cluster_1,
      cluster_2,
      cluster_3,
    ]);
    await tryber.tables.UxCampaignInsights.do().insert([
      { ...insight, id: 1, finding_id: 1, cluster_ids: "1,2" },
      { ...insight, id: 2, finding_id: 2, cluster_ids: "1,2,3" },
      { ...insight, id: 3, finding_id: 3, cluster_ids: "1,3" },
      { ...insight, id: 4, finding_id: 4, cluster_ids: "0" },
    ]);

    await tryber.tables.UxCampaignData.do().insert([campaign_ux_data]);
  });
  afterAll(async () => {
    await tryber.tables.WpAppqEvdCampaign.do().delete();
    await tryber.tables.WpAppqUserToCampaign.do().delete();
    await tryber.tables.WpAppqProject.do().delete();
    await tryber.tables.WpAppqCustomer.do().delete();
    await tryber.tables.WpAppqUsecaseCluster.do().delete();
    await tryber.tables.UxCampaignInsights.do().delete();
    await tryber.tables.UxCampaignData.do().delete();
  });
  it("Should return success 200", async () => {
    const response = await request(app)
      .get("/campaigns/1/ux?filterBy[clusters]=1")
      .set("Authorization", "Bearer user");
    expect(response.statusCode).toBe(200);
    expect(response.body.findings).toHaveLength(3);
  });

  it("Should ignore filterBy if value is not valid", async () => {
    const response = await request(app)
      .get("/campaigns/1/ux?filterBy[clusters]=test1")
      .set("Authorization", "Bearer user");

    expect(response.statusCode).toBe(200);
  });

  it("Should ignore filterBy if field is not valid", async () => {
    const response = await request(app)
      .get("/campaigns/1/ux?filterBy[test]=2")
      .set("Authorization", "Bearer user");

    expect(response.statusCode).toBe(200);
  });

  it("Should return no findings if the cluster does not exist", async () => {
    const response = await request(app)
      .get("/campaigns/1/ux?filterBy[clusters]=4")
      .set("Authorization", "Bearer user");

    expect(response.statusCode).toBe(200);
    expect(response.body.findings).toHaveLength(0);
  });

  it("Should filter by multiple clusters", async () => {
    const response = await request(app)
      .get("/campaigns/1/ux?filterBy[clusters]=1,2,0")
      .set("Authorization", "Bearer user");

    expect(response.statusCode).toBe(200);
    expect(response.body.findings).toHaveLength(4);
    expect(response.body).toEqual(
      expect.objectContaining({
        findings: [
          expect.objectContaining({
            id: 1,
          }),
          expect.objectContaining({
            id: 2,
          }),
          expect.objectContaining({
            id: 3,
          }),
          expect.objectContaining({
            id: 4,
          }),
        ],
      })
    );
  });
  it("Should filter only for the existing clusters ignoring the invalid ones", async () => {
    const response = await request(app)
      .get("/campaigns/1/ux?filterBy[clusters]=1,2,test")
      .set("Authorization", "Bearer user");
    expect(response.statusCode).toBe(200);
    expect(response.body.findings).toHaveLength(3);
    expect(response.body).toEqual(
      expect.objectContaining({
        findings: [
          expect.objectContaining({
            id: 1,
          }),
          expect.objectContaining({
            id: 2,
          }),
          expect.objectContaining({
            id: 3,
          }),
        ],
      })
    );
  });

  it("Should filter only by cluster ignoring filter by severity with only an invalid value", async () => {
    const response = await request(app)
      .get("/campaigns/1/ux?filterBy[clusters]=1,2&filterBy[severities]=test")
      .set("Authorization", "Bearer user");

    expect(response.statusCode).toBe(200);
    expect(response.body.findings).toHaveLength(3);
    expect(response.body).toEqual(
      expect.objectContaining({
        findings: [
          expect.objectContaining({
            id: 1,
          }),
          expect.objectContaining({
            id: 2,
          }),
          expect.objectContaining({
            id: 3,
          }),
        ],
      })
    );
  });

  it("Should filter for cluster 0 (general)", async () => {
    const response = await request(app)
      .get("/campaigns/1/ux?filterBy[clusters]=0")
      .set("Authorization", "Bearer user");
    expect(response.statusCode).toBe(200);
    expect(response.body.findings).toHaveLength(1);
    expect(response.body).toEqual(
      expect.objectContaining({
        findings: [
          expect.objectContaining({
            id: 4,
          }),
        ],
      })
    );
  });
});
