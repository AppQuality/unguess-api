import app from "@src/app";
import request from "supertest";
import { useBasicWorkspaces } from "@src/features/db/hooks/basicWorkspaces";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";
import { tryber } from "@src/features/database";

const campaign_type_1 = {
  id: 999,
  name: "Functional Testing (Bug Hunting)",
  type: FUNCTIONAL_CAMPAIGN_TYPE_ID,
};

const project_1 = {
  id: 999,
  display_name: "Project 999",
  customer_id: 456,
  edited_by: 1,
};

const campaign_1 = {
  id: 1,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 1 title",
  customer_title: "Campaign 1 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: campaign_type_1.id,
  campaign_type: -1,
  project_id: project_1.id,
  platform_id: 1,
  page_preview_id: 1,
  page_manual_id: 1,
  customer_id: 456,
  pm_id: 1,
  cust_bug_vis: 1,
  base_bug_internal_id: "C-",
};

const user_to_campaign_1 = {
  wp_user_id: 1,
  campaign_id: campaign_1.id,
};

const campaign_2 = {
  id: 2,
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
  platform_id: 1,
  page_preview_id: 1,
  page_manual_id: 1,
  customer_id: 456,
  pm_id: 1,
  cust_bug_vis: 1,
  base_bug_internal_id: "C-",
};

describe("POST /campaigns/{cid}/users", () => {
  const workspaces = useBasicWorkspaces();

  beforeAll(async () => {
    await tryber.tables.WpAppqEvdCampaign.do().insert(campaign_1);
    await tryber.tables.WpAppqEvdCampaign.do().insert(campaign_2);
    await tryber.tables.WpAppqUserToCampaign.do().insert(user_to_campaign_1);
  });

  afterAll(async () => {
    await tryber.tables.WpAppqEvdCampaign.do().delete();
    await tryber.tables.WpAppqUserToCampaign.do().delete();
  });

  // It should answer 403 if user is not logged in
  it("should answer 403 if user is not logged in", async () => {
    const response = await request(app)
      .post(`/campaigns/${campaign_1.id}/users`)
      .send({
        email: "vincenzo.cancelli@finestre.com",
      });

    expect(response.status).toBe(403);
  });

  // It should answer 400 if no body is sent
  it("should answer 400 if no body is sent", async () => {
    const response = await request(app)
      .post(`/campaigns/${campaign_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send();
    expect(response.status).toBe(400);
  });

  // it should add a user to the campaign
  it("should answer 200 and add a user to the campaign", async () => {
    const response = await request(app)
      .post(`/campaigns/${campaign_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "stefano.lavori@mela.com",
      });
    expect(response.status).toBe(200);

    const users = await request(app)
      .get(`/campaigns/${campaign_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send();

    expect(users.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: "stefano.lavori@mela.com",
        }),
      ])
    );
  });

  it("should answer 200 and resend invitation if the user is already in the workspace but with a pending/expired invite", async () => {
    await request(app)
      .post(`/campaigns/${campaign_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "vincenzo.cancelli@finestre.com",
      });

    const response = await request(app)
      .post(`/campaigns/${campaign_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "vincenzo.cancelli@finestre.com",
      });

    expect(response.status).toBe(200);
  });

  it("should answer 400 if the user is active and already in the campaign", async () => {
    const response = await request(app)
      .post(`/campaigns/${campaign_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "mario.rossi@example.com",
      });

    expect(response.status).toBe(400);
  });

  it("should answer 403 if the user is not allowed to apply changes in the workspace", async () => {
    const response = await request(app)
      .post(`/campaigns/${campaign_2.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "goffredo.baci@amazzonia.com",
      });

    expect(response.status).toBe(403);
  });

  it("Should return 400 but keep the user if there is an error on existing user addition", async () => {
    const response = await request(app)
      .post(`/campaigns/${campaign_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "mario.rossi@example.com",
      });

    expect(response.status).toBe(400);
  });

  // --- end of tests
});
