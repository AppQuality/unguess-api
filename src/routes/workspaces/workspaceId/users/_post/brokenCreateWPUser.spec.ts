import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import * as db from "@src/features/db";
import { jest } from "@jest/globals";

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

jest.mock(
  "@src/features/wp/createTryberWPUser",
  () => new Error("Error creating WPUser")
);

describe("POST /workspaces/wid/users with broken createTryberWPUser", () => {
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

  it("should answer 500 and remove the user if something goes wrong with wp_user creation", async () => {
    const response = await request(app)
      .post(`/workspaces/${customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "goffredo.baci@amazzonia.com",
      });

    const userExists = await db.query(
      db.format(
        `SELECT *
        FROM wp_users wpu 
          LEFT JOIN wp_appq_evd_profile p ON (p.wp_user_id = wpu.ID) 
          WHERE wpu.user_email = ?`,
        ["goffredo.baci@amazzonia.com"]
      )
    );

    expect(response.status).toBe(500);
    expect(userExists.length).toBe(0);
  });
  // --- end of tests
});
