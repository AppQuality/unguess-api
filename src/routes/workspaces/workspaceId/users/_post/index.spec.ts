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

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: customer_1.id,
};

const user_to_customer_2 = {
  wp_user_id: 2,
  customer_id: customer_2.id,
};

describe("POST /workspaces/wid/users", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.add({
          companies: [customer_1, customer_2],
          userToCustomers: [user_to_customer_1, user_to_customer_2],
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
      .post(`/workspaces/${customer_1.id}/users`)
      .send({
        email: "vincenzo.cancelli@finestre.com",
      });

    expect(response.status).toBe(403);
  });

  // It should answer 400 if no body is sent
  it("should answer 400 if no body is sent", async () => {
    const response = await request(app)
      .post(`/workspaces/${customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send();
    expect(response.status).toBe(400);
  });

  // it should add a user to the workspace
  it("should answer 200 and add a user to the workspace", async () => {
    const response = await request(app)
      .post(`/workspaces/${customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "stefano.lavori@mela.com",
      });
    expect(response.status).toBe(200);

    const users = await request(app)
      .get(`/workspaces/${customer_1.id}/users`)
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

  it("should answer 400 if the user is already in the workspace", async () => {
    await request(app)
      .post(`/workspaces/${customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "vincenzo.cancelli@finestre.com",
      });

    const response = await request(app)
      .post(`/workspaces/${customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "vincenzo.cancelli@finestre.com",
      });

    expect(response.status).toBe(400);
  });

  it("should answer 403 if the user is not allowed to apply changes in the workspace", async () => {
    const response = await request(app)
      .post(`/workspaces/${customer_2.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "goffredo.baci@amazzonia.com",
      });

    expect(response.status).toBe(403);
  });

  it("Should return 500 but keep the user if there is an error on existing user addition", async () => {
    const response = await request(app)
      .post(`/workspaces/${customer_2.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "giovanni.bianchi@example.com",
      });

    expect(response.status).toBe(403);
  });

  // --- end of tests
});
