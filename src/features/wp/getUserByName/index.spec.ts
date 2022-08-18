import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import defaultUsers from "@src/__mocks__/database/seed/users.json";
import getUserByName from ".";

describe("wp/getUserByName", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.create();
        await dbAdapter.add({
          unguess_users: defaultUsers,
        });
      } catch (error) {
        console.log(error);
        reject(error);
      }

      resolve(true);
    });
  });

  afterAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.drop();
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  it("Should return an error if user doesn't exists", async () => {
    try {
      await getUserByName("ciccio");
    } catch (error: any) {
      expect(error.code).toBe(403);
      expect(error.message).toBe("Something went wrong");
    }
  });

  it("Should return a user if user exists", async () => {
    const user = await getUserByName("mario.rossi@example.com");
    expect(user).toEqual(
      expect.objectContaining({
        ID: 1,
        user_email: "mario.rossi@example.com",
        user_login: "mario.rossi@example.com",
        user_pass: "password",
      })
    );
  });
});
