import app from "@src/app";
import request from "supertest";
import { tryber } from "@src/features/database";
import { useBasicProjectsContext } from "@src/features/db/hooks/basicProjects";

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

const project_without_users = {
  id: 4,
  customer_id: customer_wo_users.id,
  display_name: "Project without users",
  edited_by: 32,
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
  project_id: 1,
};

const expired_to_customer_3 = {
  wp_user_id: expired_profile.wp_user_id,
  project_id: 2,
};

describe("GET /projects/{pid}/users", () => {
  const context = useBasicProjectsContext();

  beforeAll(async () => {
    await tryber.tables.WpAppqCustomer.do().insert(customer_3);
    await tryber.tables.WpAppqCustomer.do().insert(customer_wo_users);

    await tryber.tables.WpAppqProject.do().insert(project_without_users);

    await tryber.tables.WpAppqEvdProfile.do().insert(invited_profile);
    await tryber.tables.WpAppqEvdProfile.do().insert(expired_profile);

    await tryber.tables.WpAppqUserToProject.do().insert(invited_to_customer_1);
    await tryber.tables.WpAppqUserToProject.do().insert(expired_to_customer_3);

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
      `/projects/${context.prj1.id}/users`
    );
    expect(response.status).toBe(403);
  });

  it("Should return 200 status if user is logged in", async () => {
    const response = await request(app)
      .get(`/projects/${context.prj1.id}/users`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should return 400 if the request parameter has a bad format", async () => {
    const response = await request(app)
      .get("/projects/banana/users")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(400);
  });

  it("Should return 403 if the user is not found", async () => {
    const response = await request(app)
      .get("/projects/999898978/users")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  it("Should return 403 if the user is not allowed to view project users", async () => {
    const response = await request(app)
      .get(`/projects/${context.prj2.id}/users`)
      .set("authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  it("Should return an array of 1 elements because of limit = 1", async () => {
    const response = await request(app)
      .get(`/projects/${context.prj1.id}/users?limit=1`)
      .set("authorization", "Bearer user");
    expect(response.body.items).toHaveLength(1);
  });

  it("Should return a paginated response with an array of users", async () => {
    const response = await request(app)
      .get(`/projects/${context.prj1.id}/users`)
      .set("authorization", "Bearer user");

    expect(response.body.size).toBe(2);

    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: invited_profile.wp_user_id,
          profile_id: invited_profile.id,
          name: invited_profile.name + " " + invited_profile.surname,
          email: invited_profile.email,
          invitationPending: true,
        }),
        expect.objectContaining({
          id: context.profile2.wp_user_id,
          profile_id: context.profile2.id,
          name: context.profile2.name + " " + context.profile2.surname,
          email: context.profile2.email,
          invitationPending: false,
        }),
      ])
    );
  });

  it("Should return an empty array items if the project does not have users", async () => {
    const response = await request(app)
      .get(`/projects/${project_without_users.id}/users`)
      .set("authorization", "Bearer admin");

    expect(response.status).toBe(200);
    expect(response.body.items).toEqual([]);
  });

  it("Should return an user even if the token is invalid", async () => {
    const response = await request(app)
      .get(`/projects/${context.prj2.id}/users`)
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
