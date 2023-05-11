import { tryber } from "@src/features/database";
import createUserProfile from ".";

describe("wp/createUserProfile", () => {
  beforeAll(async () => {
    await tryber.tables.WpUsers.do().insert({
      ID: 666,
      user_email: "vincenzo.cancelli@finestre.com",
    });
  });

  it("Should return an error if wp_user doesn't exist", async () => {
    try {
      await createUserProfile({
        email: "stefano.lavori@mela.com",
        tryber_wp_id: 99999,
      });
    } catch (error: any) {
      expect(error.code).toBe(403);
      expect(error.message).toBe("Something went wrong");
    }
  });

  it("Should return a user if user exists", async () => {
    const profile = await createUserProfile({
      email: "vincenzo.cancelli@finestre.com",
      tryber_wp_id: 666,
    });
    expect(profile).toEqual(
      expect.objectContaining({
        tryber_wp_id: 666,
      })
    );
  });
});
