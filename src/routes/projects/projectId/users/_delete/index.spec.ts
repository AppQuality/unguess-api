import app from "@src/app";
import request from "supertest";
import { tryber } from "@src/features/database";
import { useBasicProjectsContext } from "@src/features/db/hooks/basicProjects";

const invited_profile = {
  id: 35,
  wp_user_id: 15,
  name: "Customer Invited",
  surname: "Customer Invited",
  email: "Invited@unguess.io",
  employment_id: -1,
  education_id: -1,
};

const invited_to_project_1 = {
  wp_user_id: invited_profile.wp_user_id,
  project_id: 1,
};

describe("DELETE /projects/wid/users", () => {
  const context = useBasicProjectsContext();

  beforeAll(async () => {
    await tryber.tables.WpAppqEvdProfile.do().insert(invited_profile);
    await tryber.tables.WpAppqUserToProject.do().insert(invited_to_project_1);
  });

  afterAll(async () => {
    await tryber.tables.WpAppqEvdProfile.do().delete();
    await tryber.tables.WpAppqUserToProject.do().delete();
  });

  // It should answer 403 if user is not logged in
  it("should answer 403 if user is not logged in", async () => {
    const response = await request(app)
      .delete(`/projects/${context.prj1.id}/users`)
      .send({
        user_id: 2,
      });

    expect(response.status).toBe(403);
  });

  // It should answer 400 if no body is sent
  it("should answer 400 if no body has a wrong format", async () => {
    const response = await request(app)
      .delete(`/projects/${context.prj1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        user_id: "Alfredo",
      });
    expect(response.status).toBe(400);
  });

  it("should answer 400 if no body is sent", async () => {
    const response = await request(app)
      .delete(`/projects/${context.prj1.id}/users`)
      .set("Authorization", "Bearer user")
      .send();
    expect(response.status).toBe(400);
  });

  // it should add a user to the project
  it("should answer 400 if the user provided is not in the project", async () => {
    const response = await request(app)
      .delete(`/projects/${context.prj1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        user_id: 999,
      });
    expect(response.status).toBe(400);
  });

  it("should answer 200 and remove the user from project", async () => {
    const response = await request(app)
      .delete(`/projects/${context.prj1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        user_id: context.profile2.wp_user_id,
      });
    expect(response.status).toBe(200);

    const users = await request(app)
      .get(`/projects/${context.prj1.id}/users`)
      .set("Authorization", "Bearer user")
      .send();

    expect(users.body.items).toHaveLength(1);
  });

  // --- end of tests
});
