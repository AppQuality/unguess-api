import app from "@src/app";
import request from "supertest";
import { useBasicWorkspaces } from "@src/features/db/hooks/basicWorkspaces";
import { tryber } from "@src/features/database";
import { FUNCTIONAL_CAMPAIGN_TYPE_ID } from "@src/utils/constants";

const customer_3 = {
  id: 3,
  company: "Niu Company",
  company_logo: "logo.png",
  tokens: 101,
  pm_id: 32,
};

const customer_wo_users = {
  id: 4,
  company: "Empty Company",
  company_logo: "logo.png",
  tokens: 101,
  pm_id: 32,
};

const invited_profile = {
  id: 35,
  wp_user_id: 15,
  name: "Customer Invited",
  surname: "Customer Invited",
  email: "invited@unguess.io",
  employment_id: -1,
  education_id: -1,
};

const expired_profile = {
  id: 36,
  wp_user_id: 16,
  name: "Customer Expired",
  surname: "Customer Expired",
  email: "expired@unguess.io",
  employment_id: -1,
  education_id: -1,
};

const user_to_campaign = {
  wp_user_id: 1,
  campaign_id: 1,
};

const invited_to_customer_2 = {
  wp_user_id: invited_profile.wp_user_id,
  campaign_id: 1,
};

const expired_to_customer_3 = {
  wp_user_id: expired_profile.wp_user_id,
  campaign_id: 1,
};

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

const project_2 = {
  id: 1000,
  display_name: "Project 1000",
  customer_id: 123,
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
  project_id: project_2.id,
  platform_id: 1,
  page_preview_id: 1,
  page_manual_id: 1,
  customer_id: 456,
  pm_id: 1,
  cust_bug_vis: 1,
  base_bug_internal_id: "C-",
};

describe("GET /campaigns/{cid}/users", () => {
  const context = useBasicWorkspaces();

  beforeAll(async () => {
    await tryber.tables.WpAppqCustomer.do().insert(customer_3);
    await tryber.tables.WpAppqCustomer.do().insert(customer_wo_users);

    await tryber.tables.WpAppqEvdCampaign.do().insert(campaign_1);
    await tryber.tables.WpAppqEvdCampaign.do().insert(campaign_2);

    await tryber.tables.WpAppqProject.do().insert(project_1);
    await tryber.tables.WpAppqProject.do().insert(project_2);

    await tryber.tables.WpAppqEvdProfile.do().insert(invited_profile);
    await tryber.tables.WpAppqEvdProfile.do().insert(expired_profile);

    await tryber.tables.WpAppqUserToCampaign.do().insert(user_to_campaign);
    await tryber.tables.WpAppqUserToCampaign.do().insert(invited_to_customer_2);
    await tryber.tables.WpAppqUserToCampaign.do().insert(expired_to_customer_3);

    //Active user with an active invite
    await tryber.tables.WpAppqCustomerAccountInvitations.do().insert({
      status: "1",
      tester_id: context.profile2.id,
      token: "XXX",
    });

    // pending invitation
    await tryber.tables.WpAppqCustomerAccountInvitations.do().insert({
      status: "0",
      tester_id: invited_profile.id,
      token: "YYY",
    });

    // expired invitation
    await tryber.tables.WpAppqCustomerAccountInvitations.do().insert({
      status: "-1",
      tester_id: expired_profile.id,
      token: "ZZZ",
    });
  });

  afterAll(async () => {
    await tryber.tables.WpAppqCustomerAccountInvitations.do().delete();
    await tryber.tables.WpAppqUserToCampaign.do().delete();
    await tryber.tables.WpAppqEvdProfile.do().delete();
    await tryber.tables.WpAppqEvdCampaign.do().delete();
    await tryber.tables.WpAppqCustomer.do().delete();
  });

  it("Should return 403 status if user is not logged in", async () => {
    const response = await request(app).get(
      `/campaigns/${campaign_1.id}/users`
    );
    expect(response.status).toBe(403);
  });

  it("Should return 200 status if user is logged in", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/users`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should return 400 if the request parameter has a bad format", async () => {
    const response = await request(app)
      .get("/campaigns/banana/users")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should return 400 if the campaign is not found", async () => {
    const response = await request(app)
      .get("/campaigns/999898978/users")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should return 403 if the user is not allowed to view campaign users", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_2.id}/users`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  it("Should return an array of 1 elements because of limit = 1", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/users?limit=1`)
      .set("authorization", "Bearer user");
    expect(response.body.items).toHaveLength(1);
  });

  it("Should return a paginated response with an array of users", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/users`)
      .set("authorization", "Bearer user");

    expect(response.body.size).toBe(3);

    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expired_profile.wp_user_id,
          profile_id: expired_profile.id,
          name: expired_profile.name + " " + expired_profile.surname,
          email: expired_profile.email,
          invitationPending: true,
        }),
        expect.objectContaining({
          id: invited_profile.wp_user_id,
          profile_id: invited_profile.id,
          name: invited_profile.name + " " + invited_profile.surname,
          email: invited_profile.email,
          invitationPending: true,
        }),
        expect.objectContaining({
          id: context.profile1.wp_user_id,
          profile_id: context.profile1.id,
          name: context.profile1.name + " " + context.profile1.surname,
          email: context.profile1.email,
          invitationPending: false,
        }),
      ])
    );
  });

  it("Should return an empty array items if the user doesn't have users", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_2.id}/users`)
      .set("authorization", "Bearer admin");

    expect(response.body.items).toEqual([]);
  });

  it("Should return an user even if the token is invalid", async () => {
    const response = await request(app)
      .get(`/campaigns/${campaign_1.id}/users`)
      .set("authorization", "Bearer admin");

    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expired_profile.wp_user_id,
          profile_id: expired_profile.id,
          name: expired_profile.name + " " + expired_profile.surname,
          email: expired_profile.email,
          invitationPending: true,
        }),
      ])
    );
  });

  // end of describe
});
