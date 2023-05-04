import app from "@src/app";
import request from "supertest";
import { useBasicWorkspaces } from "@src/features/db/hooks/basicWorkspaces";
import { tryber } from "@src/features/database";

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

const invited_to_customer_1 = {
  wp_user_id: invited_profile.wp_user_id,
  customer_id: 456,
};

const expired_to_customer_3 = {
  wp_user_id: expired_profile.wp_user_id,
  customer_id: customer_3.id,
};

describe("GET /workspaces/{wid}/users", () => {
  const context = useBasicWorkspaces();

  beforeAll(async () => {
    await tryber.tables.WpAppqCustomer.do().insert(customer_3);
    await tryber.tables.WpAppqCustomer.do().insert(customer_wo_users);

    await tryber.tables.WpAppqEvdProfile.do().insert(invited_profile);
    await tryber.tables.WpAppqEvdProfile.do().insert(expired_profile);

    await tryber.tables.WpAppqUserToCustomer.do().insert(invited_to_customer_1);
    await tryber.tables.WpAppqUserToCustomer.do().insert(expired_to_customer_3);

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
  });

  it("Should return 403 status if user is not logged in", async () => {
    const response = await request(app).get(
      `/workspaces/${context.customer_1.id}/users`
    );
    expect(response.status).toBe(403);
  });

  it("Should return 200 status if user is logged in", async () => {
    const response = await request(app)
      .get(`/workspaces/${context.customer_1.id}/users`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should return 400 if the request parameter has a bad format", async () => {
    const response = await request(app)
      .get("/workspaces/banana/users")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should return 403 if the customer is not found", async () => {
    const response = await request(app)
      .get("/workspaces/999898978/users")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  it("Should return 403 if the customer is not allowed to view workspace users", async () => {
    const response = await request(app)
      .get(`/workspaces/${context.customer_2.id}/users`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  it("Should return an array of 1 elements because of limit = 1", async () => {
    const response = await request(app)
      .get(`/workspaces/${context.customer_1.id}/users?limit=1`)
      .set("authorization", "Bearer user");
    expect(response.body.items).toHaveLength(1);
  });

  it("Should return a paginated response with an array of users", async () => {
    const response = await request(app)
      .get(`/workspaces/${context.customer_1.id}/users`)
      .set("authorization", "Bearer user");

    expect(response.body.size).toBe(3);

    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: context.profile1.wp_user_id,
          profile_id: context.profile1.id,
          name: context.profile1.name + " " + context.profile1.surname,
          email: context.profile1.email,
          invitationPending: false,
        }),
        expect.objectContaining({
          id: context.profile2.wp_user_id,
          profile_id: context.profile2.id,
          name: context.profile2.name + " " + context.profile2.surname,
          email: context.profile2.email,
          invitationPending: false,
        }),
        expect.objectContaining({
          id: invited_profile.wp_user_id,
          profile_id: invited_profile.id,
          name: invited_profile.name + " " + invited_profile.surname,
          email: invited_profile.email,
          invitationPending: true,
        }),
      ])
    );
  });

  it("Should return an empty array items if the customer doesn't have users", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_wo_users.id}/users`)
      .set("authorization", "Bearer admin");

    expect(response.body.items).toEqual([]);
  });

  it("Should return an user even if the token is invalid", async () => {
    const response = await request(app)
      .get(`/workspaces/${customer_3.id}/users`)
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
