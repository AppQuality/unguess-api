import app from "@src/app";
import request from "supertest";
import { jest } from "@jest/globals";
import { tryber } from "@src/features/database";
import { useBasicProjectsContext } from "@src/features/db/hooks/basicProjects";

jest.mock(
  "@src/features/wp/createTryberWPUser",
  () => new Error("Error creating WPUser")
);

describe("POST /projects/pid/users with broken createTryberWPUser", () => {
  const context = useBasicProjectsContext();

  it("should answer 500 and remove the user if something goes wrong with wp_user creation", async () => {
    const response = await request(app)
      .post(`/projects/${context.prj1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: "goffredo.baci@amazzonia.com",
      });

    const userExists = await tryber.tables.WpUsers.do()
      .select()
      .leftJoin(
        "wp_appq_evd_profile",
        "wp_appq_evd_profile.wp_user_id",
        "wp_users.ID"
      )
      .where({
        user_email: "goffredo.baci@amazzonia.com",
      });

    expect(response.status).toBe(500);
    expect(userExists.length).toBe(0);
  });
  // --- end of tests
});
