import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import customerInvitations from "@src/__mocks__/database/customer_invitations";

const customer_1 = {
  id: 1,
  company: "Company",
  company_logo: "logo.png",
  tokens: 100,
};

const customer_2 = {
  id: 2,
  company: "Company",
  company_logo: "logo.png",
  tokens: 100,
};

const customer_3 = {
  id: 3,
  company: "Niu Company",
  company_logo: "logo.png",
  tokens: 101,
};

const profile_1 = {
  id: 1,
  wp_user_id: 1,
  name: "Customer 1",
  surname: "Customer 1",
  email: "customer1@unguess.io",
};

const profile_2 = {
  id: 33,
  wp_user_id: 13,
  name: "Customer 2",
  surname: "Customer 2",
  email: "customer2@unguess.io",
};

const profile_3 = {
  id: 34,
  wp_user_id: 14,
  name: "Customer 3",
  surname: "Customer 3",
  email: "customer3@unguess.io",
};

const invited_profile = {
  id: 35,
  wp_user_id: 15,
  name: "Customer Invited",
  surname: "Customer Invited",
  email: "Invited@unguess.io",
};

const expired_profile = {
  id: 36,
  wp_user_id: 16,
  name: "Customer Expired",
  surname: "Customer Expired",
  email: "Expired@unguess.io",
};

const user1_to_customer_1 = {
  wp_user_id: profile_1.wp_user_id,
  customer_id: 1,
};
const user2_to_customer_1 = {
  wp_user_id: profile_2.wp_user_id,
  customer_id: 1,
};
const user3_to_customer_1 = {
  wp_user_id: profile_3.wp_user_id,
  customer_id: 1,
};
const invited_to_customer_1 = {
  wp_user_id: invited_profile.wp_user_id,
  customer_id: 1,
};

const expired_to_customer_3 = {
  wp_user_id: expired_profile.wp_user_id,
  customer_id: 3,
};

describe("GET /workspaces/{wid}/users", () => {
  beforeAll(async () => {
    return new Promise(async (res, rej) => {
      try {
        await dbAdapter.add({
          profiles: [
            profile_1,
            profile_2,
            profile_3,
            invited_profile,
            expired_profile,
          ],
          companies: [customer_1, customer_2, customer_3],
          userToCustomers: [
            user1_to_customer_1,
            user2_to_customer_1,
            user3_to_customer_1,
            invited_to_customer_1,
            expired_to_customer_3,
          ],
        });

        await customerInvitations.insert({
          status: "1",
          tester_id: profile_3.id,
        });

        await customerInvitations.insert({
          status: "0",
          tester_id: invited_profile.id,
        });

        await customerInvitations.insert({
          status: "-1",
          tester_id: expired_profile.id,
        });
      } catch (e) {
        console.error(e);
        rej(e);
      }
      res(true);
    });
  });

  it("Should return 403 status if user is not logged in", async () => {
    const response = await request(app).get("/workspaces/1/users");
    expect(response.status).toBe(403);
  });

  it("Should return 200 status if user is logged in", async () => {
    const response = await request(app)
      .get("/workspaces/1/users")
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
      .get("/workspaces/2/users")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(403);
  });

  it("Should return an array of 1 elements because of limit = 1", async () => {
    const response = await request(app)
      .get("/workspaces/1/users?limit=1")
      .set("authorization", "Bearer user");
    expect(response.body.items).toHaveLength(1);
  });

  it("Should return a paginated response with an array of users", async () => {
    const response = await request(app)
      .get("/workspaces/1/users")
      .set("authorization", "Bearer user");

    expect(response.body.size).toBe(4);

    expect(response.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: profile_1.wp_user_id,
          profile_id: profile_1.id,
          name: profile_1.name + " " + profile_1.surname,
          email: profile_1.email,
          invitationPending: false,
        }),
        expect.objectContaining({
          id: profile_2.wp_user_id,
          profile_id: profile_2.id,
          name: profile_2.name + " " + profile_2.surname,
          email: profile_2.email,
          invitationPending: false,
        }),
        expect.objectContaining({
          id: profile_3.wp_user_id,
          profile_id: profile_3.id,
          name: profile_3.name + " " + profile_3.surname,
          email: profile_3.email,
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
      .get("/workspaces/2/users")
      .set("authorization", "Bearer admin");

    expect(response.body.items).toEqual([]);
  });

  it("Should return an user even if the token is invalid", async () => {
    const response = await request(app)
      .get("/workspaces/3/users")
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