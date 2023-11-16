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

const insight = {
  campaign_id: 1,
  version: 1,
  title: "Insight title",
  description: "Insight description",
  severity_id: 1,
  cluster_ids: "1,2,3",
  order: 1,
  finding_id: 1,
  enabled: 1,
};

describe("/campaigns/cid/ux?filterBy[severity]", () => {
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
      {
        id: 3,
        campaign_id: 1,
        title: "Cluster 3",
        subtitle: "subtitle",
      },
    ]);

    await tryber.tables.UxCampaignData.do().insert([
      {
        campaign_id: 1,
        version: 1,
        published: 1,
      },
    ]);

    await tryber.tables.UxCampaignInsights.do().insert([
      {
        ...insight,
        id: 1,
      },
      {
        ...insight,
        id: 2,
        severity_id: 2,
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
  });

  it("Should return 200", async () => {
    const response = await request(app)
      .get("/campaigns/1/ux?filterBy[severities]=1")
      .set("Authorization", "Bearer user");

    expect(response.statusCode).toBe(200);
    expect(response.body.findings).toHaveLength(1);
  });

  it("Should ignore filterBy if value is not valid", async () => {
    const response = await request(app)
      .get("/campaigns/1/ux?filterBy[severities]=test")
      .set("Authorization", "Bearer user");

    expect(response.statusCode).toBe(200);
  });

  it("Should ignore filterBy if field is not valid", async () => {
    const response = await request(app)
      .get("/campaigns/1/ux?filterBy[test]=1")
      .set("Authorization", "Bearer user");

    expect(response.statusCode).toBe(200);
  });

  it("Should return no findings", async () => {
    const response = await request(app)
      .get("/campaigns/1/ux?filterBy[severities]=6")
      .set("Authorization", "Bearer user");

    expect(response.statusCode).toBe(200);
    expect(response.body.findings).toHaveLength(0);
  });

  it("Should filter by multiple severities", async () => {
    const response = await request(app)
      .get("/campaigns/1/ux?filterBy[severities]=1,2")
      .set("Authorization", "Bearer user");

    expect(response.statusCode).toBe(200);
    expect(response.body.findings).toHaveLength(2);
    expect(response.body).toEqual(
      expect.objectContaining({
        findings: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
          }),
          expect.objectContaining({
            id: 2,
          }),
        ]),
      })
    );
  });

  it("Should filter by multiple severities and ignore invalid one", async () => {
    const response = await request(app)
      .get("/campaigns/1/ux?filterBy[severities]=1,2,test")
      .set("Authorization", "Bearer user");

    expect(response.statusCode).toBe(200);
    expect(response.body.findings).toHaveLength(2);
    expect(response.body).toEqual(
      expect.objectContaining({
        findings: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
          }),
          expect.objectContaining({
            id: 2,
          }),
        ]),
      })
    );
  });
});
