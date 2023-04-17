import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import * as db from "@src/features/db";

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

const profile1 = {
  id: 10001,
  name: "Mario",
  surname: "Rossi",
  email: "stefano.lavori@example.com",
  wp_user_id: 11001,
};

const user1 = {
  ID: profile1.wp_user_id,
  user_email: profile1.email,
};

const profile2 = {
  id: 10002,
  name: "Giovanni",
  surname: "Bianchi",
  email: "vincenzo.cancelli@example.com",
  wp_user_id: 11002,
};

const user2 = {
  ID: profile2.wp_user_id,
  user_email: profile2.email,
};

const user_to_customer_1 = {
  wp_user_id: 1, // Bearer User
  customer_id: customer_1.id,
};

const user_to_customer_2 = {
  wp_user_id: profile2.wp_user_id,
  customer_id: customer_2.id,
};

jest.mock(
  "@src/features/wp/createUserProfile",
  () => new Error("Error creating User Profile")
);

describe("POST /workspaces/wid/users with broken createUserProfile", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.add({
          companies: [customer_1, customer_2],
          profiles: [profile1, profile2],
          users: [user1, user2],
          userToCustomers: [user_to_customer_1, user_to_customer_2],
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  it("should answer 500 and remove the user if something goes wrong with wp_profile creation", async () => {
    const newUserEmail = "donaldo.briscola@torrebriscola.com";

    const response = await request(app)
      .post(`/workspaces/${customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: newUserEmail,
      });

    const userExists = await db.query(
      db.format(
        `SELECT *
          FROM wp_users wpu 
            LEFT JOIN wp_appq_evd_profile p ON (p.wp_user_id = wpu.ID) 
            WHERE wpu.user_email = ?`,
        [newUserEmail]
      )
    );

    expect(response.status).toBe(500);
    expect(userExists.length).toBe(0);
  });
  // --- end of tests
});
