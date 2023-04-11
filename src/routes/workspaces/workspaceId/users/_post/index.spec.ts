import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import UnlayerTemplate from "@src/__mocks__/database/unlayer_mail_template";
import MailEvents from "@src/__mocks__/database/event_transactional_mail";

const customer_1 = {
  id: 999,
  company: "Company 999",
  company_logo: "logo999.png",
  tokens: 100,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 999,
};

describe("POST /workspaces/wid/users", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.add({
          companies: [customer_1],
          userToCustomers: [user_to_customer_1],
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
        email: "bill.gates@unguess.io",
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
        email: "cannarozzo.luca+test2@gmail.com",
      });
    expect(response.status).toBe(200);

    console.log(response.body);
  });
});
