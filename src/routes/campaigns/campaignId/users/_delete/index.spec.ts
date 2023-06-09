import app from "@src/app";
import request from "supertest";
import { useBasicWorkspaces } from "@src/features/db/hooks/basicWorkspaces";
import { tryber } from "@src/features/database";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";

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

const invited_profile = {
  id: 35,
  wp_user_id: 15,
  name: "Customer Invited",
  surname: "Customer Invited",
  email: "Invited@unguess.io",
  employment_id: -1,
  education_id: -1,
};

const invited_to_campaign_1 = {
  wp_user_id: 1,
  campaign_id: 1,
};

const invited_to_campaign_2 = {
  wp_user_id: 2,
  campaign_id: 1,
};

describe("DELETE /campaigns/cid/users", () => {
  const context = useBasicWorkspaces();

  beforeAll(async () => {
    await tryber.tables.WpAppqEvdProfile.do().insert(invited_profile);
    await tryber.tables.WpAppqUserToCampaign.do().insert(invited_to_campaign_1);
    await tryber.tables.WpAppqUserToCampaign.do().insert(invited_to_campaign_2);
    await tryber.tables.WpAppqEvdCampaign.do().insert(campaign_1);
    await tryber.tables.WpAppqProject.do().insert(project_1);
  });

  afterAll(async () => {
    await tryber.tables.WpAppqEvdProfile.do().delete();
    await tryber.tables.WpAppqEvdProfile.do().delete();
    await tryber.tables.WpAppqUserToCampaign.do().delete();
    await tryber.tables.WpAppqEvdCampaign.do().delete();
  });

  // It should answer 403 if user is not logged in
  it("should answer 403 if user is not logged in", async () => {
    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/users`)
      .send({
        user_id: 2,
      });

    expect(response.status).toBe(403);
  });

  // It should answer 400 if no body is sent
  it("should answer 400 if no body has a wrong format", async () => {
    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        user_id: "Alfredo",
      });
    expect(response.status).toBe(400);
  });

  it("should answer 400 if no body is sent", async () => {
    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send();
    expect(response.status).toBe(400);
  });

  it("should answer 400 if the user provided is not in the campaign", async () => {
    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        user_id: 999,
      });
    expect(response.status).toBe(400);
  });

  it("should answer 200 and remove the user from the campaign", async () => {
    const response = await request(app)
      .delete(`/campaigns/${campaign_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        user_id: context.profile2.wp_user_id,
      });
    expect(response.status).toBe(200);

    const users = await request(app)
      .get(`/campaigns/${campaign_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send();

    expect(users.body.items).toHaveLength(1);
  });

  // --- end of tests
});
