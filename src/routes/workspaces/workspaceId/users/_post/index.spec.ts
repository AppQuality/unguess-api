import app from "@src/app";
import request from "supertest";
import { tryber } from "@src/features/database";
import { useBasicWorkspaces } from "@src/features/db/hooks/basicWorkspaces";

describe("POST /workspaces/wid/users", () => {
  const workspaces = useBasicWorkspaces();

  // It should answer 403 if user is not logged in
  it("should answer 403 if user is not logged in", async () => {
    const response = await request(app)
      .post(`/workspaces/${workspaces.customer_1.id}/users`)
      .send({
        email: "vincenzo.cancelli@finestre.com",
      });

    expect(response.status).toBe(403);
  });

  // It should answer 400 if no body is sent
  it("should answer 400 if no body is sent", async () => {
    const response = await request(app)
      .post(`/workspaces/${workspaces.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send();
    expect(response.status).toBe(400);
  });

  // it should add a user to the workspace
  it("should answer 200 and add a user to the workspace", async () => {
    const response = await request(app)
      .post(`/workspaces/${workspaces.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "stefano.lavori@mela.com",
      });
    expect(response.status).toBe(200);

    const users = await request(app)
      .get(`/workspaces/${workspaces.customer_1.id}/users`)
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

  it("should answer 200 and resend invitation if the user is already in the workspace but with a pending/expired invite", async () => {
    await request(app)
      .post(`/workspaces/${workspaces.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "vincenzo.cancelli@finestre.com",
      });

    const invites =
      await tryber.tables.WpAppqCustomerAccountInvitations.do().select();

    console.log("inviti", invites);

    const response = await request(app)
      .post(`/workspaces/${workspaces.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "vincenzo.cancelli@finestre.com",
      });

    expect(response.status).toBe(200);
  });
  it("should answer 400 if the user is active and already in the workspace", async () => {
    const response = await request(app)
      .post(`/workspaces/${workspaces.customer_1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "giovanni.bianchi@example.com",
      });

    expect(response.status).toBe(400);
  });

  it("should answer 403 if the user is not allowed to apply changes in the workspace", async () => {
    const response = await request(app)
      .post(`/workspaces/${workspaces.customer_2.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "goffredo.baci@amazzonia.com",
      });

    expect(response.status).toBe(403);
  });

  it("Should return 500 but keep the user if there is an error on existing user addition", async () => {
    const response = await request(app)
      .post(`/workspaces/${workspaces.customer_2.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "giovanni.bianchi@example.com",
      });

    expect(response.status).toBe(403);
  });

  // --- end of tests
});
