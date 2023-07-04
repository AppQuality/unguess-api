import app from "@src/app";
import { tryber, unguess } from "@src/features/database";
import request from "supertest";
import { HashPassword } from "wordpress-hash-node";
jest.unmock("jsonwebtoken");

describe("Authenticate", () => {
  beforeAll(async () => {
    await unguess.tables.WpUsers.do().insert({
      ID: 1,
      user_login: "admin",
      user_email: "admin@unguess.io",
      user_pass: HashPassword("admin"),
    });

    await unguess.tables.WpUnguessUserToCustomer.do().insert({
      unguess_wp_user_id: 1,
      tryber_wp_user_id: 12,
      profile_id: 44,
    });

    await tryber.tables.WpUsers.do().insert({
      ID: 12,
      user_login: "admin",
      user_email: "admin@unguess.io",
      user_pass: HashPassword("uselesspassword"),
    });

    await tryber.tables.WpAppqEvdProfile.do().insert({
      id: 44,
      wp_user_id: 12,
      email: "",
      education_id: 0,
      employment_id: 0,
    });
  });

  it("should return 200 when password is correct", async () => {
    const response = await request(app).post("/authenticate").send({
      username: "admin@unguess.io",
      password: "admin",
    });
    expect(response.status).toBe(200);
  });

  it("should return 401 when password is not correct", async () => {
    const response = await request(app).post("/authenticate").send({
      username: "admin@unguess.io",
      password: "wrong",
    });
    expect(response.status).toBe(403);
  });
});
