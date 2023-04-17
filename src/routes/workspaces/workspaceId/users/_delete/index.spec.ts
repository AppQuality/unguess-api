import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";

const customer_2 = {
  id: 123,
  company: "Mela Inc.",
  company_logo: "logo999.png",
  tokens: 100,
};

const customer_1 = {
  id: 456,
  company: "PiccoloProgramma Corporation",
  company_logo: "logo999.png",
  tokens: 100,
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

const user1_to_customer_1 = {
  wp_user_id: profile_1.wp_user_id,
  customer_id: customer_1.id,
};
const user2_to_customer_1 = {
  wp_user_id: profile_2.wp_user_id,
  customer_id: customer_1.id,
};
const user3_to_customer_1 = {
  wp_user_id: profile_3.wp_user_id,
  customer_id: customer_1.id,
};
const invited_to_customer_1 = {
  wp_user_id: invited_profile.wp_user_id,
  customer_id: customer_1.id,
};

describe("DELETE /workspaces/wid/users", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.add({
          companies: [customer_1, customer_2],
          profiles: [profile_1, profile_2, profile_3, invited_profile],
          userToCustomers: [
            user1_to_customer_1,
            user2_to_customer_1,
            user3_to_customer_1,
            invited_to_customer_1,
          ],
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  // It should answer 403 if user is not logged in
  it("should answer 403 if user is not logged in", async () => {
    const response = await request(app)
      .delete(`/workspaces/${customer_1.id}/users`)
      .send({
        user_id: 2,
      });

    expect(response.status).toBe(403);
  });

  // It should answer 400 if no body is sent
  it("should answer 400 if no body has a wrong format", async () => {
    const response = await request(app)
      .delete(`/workspaces/${customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        user_id: "Alfredo",
      });
    expect(response.status).toBe(400);
  });

  it("should answer 400 if no body is sent", async () => {
    const response = await request(app)
      .delete(`/workspaces/${customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send();
    expect(response.status).toBe(400);
  });

  // it should add a user to the workspace
  it("should answer 400 if the user provided is not in the workspace", async () => {
    const response = await request(app)
      .delete(`/workspaces/${customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        user_id: 999,
      });
    expect(response.status).toBe(400);
  });

  it("should answer 200 and remove the user from workspace", async () => {
    const response = await request(app)
      .delete(`/workspaces/${customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        user_id: profile_2.wp_user_id,
      });
    expect(response.status).toBe(200);

    const users = await request(app)
      .get(`/workspaces/${customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send();

    expect(users.body.items).toHaveLength(3);
  });

  // --- end of tests
});
