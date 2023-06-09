import app from "@src/app";
import request from "supertest";
import { tryber } from "@src/features/database";
import { useBasicProjectsContext } from "@src/features/db/hooks/basicProjects";

jest.mock(
  "@src/features/wp/createUserProfile",
  () => new Error("Error creating User Profile")
);

describe("POST /projects/pid/users with broken createUserProfile", () => {
  const context = useBasicProjectsContext();

  it("should answer 500 and remove the user if something goes wrong with wp_profile creation", async () => {
    const newUserEmail = "donaldo.briscola@torrebriscola.com";

    const response = await request(app)
      .post(`/projects/${context.prj1.id}/users`)
      .set("Authorization", "Bearer user")
      .send({
        email: newUserEmail,
      });

    const userExists = await tryber.tables.WpUsers.do()
      .select()
      .leftJoin(
        "wp_appq_evd_profile",
        "wp_appq_evd_profile.wp_user_id",
        "wp_users.ID"
      )
      .where({
        user_email: newUserEmail,
      });

    expect(response.status).toBe(500);
    expect(userExists.length).toBe(0);
  });
  // --- end of tests
});
