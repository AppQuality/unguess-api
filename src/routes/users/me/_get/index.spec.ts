import app from "@src/app";
import request from "supertest";
import { getGravatar } from "@src/utils/users";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import companyBasic from "@src/__mocks__/database/companyBasic";

jest.mock("@src/utils/users", () => ({
  ...jest.requireActual("@src/utils/users"),
  getGravatar: jest.fn(),
}));

const mockedGetGravatar = getGravatar as jest.MockedFunction<
  typeof getGravatar
>;

describe("GET /users/me", () => {
  mockedGetGravatar.mockImplementation(
    async (email) => `https://gravatar.com/avatar/${email}`
  );

  beforeAll(async () => {
    await dbAdapter.add({
      ...companyBasic,
      features: [
        {
          id: 1,
          slug: "flying",
          display_name: "Flying",
        },
      ],
      userToFeatures: [
        {
          unguess_wp_user_id: 1,
          feature_id: 1,
        },
      ],
    });
  });

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).get("/users/me");
    expect(response.status).toBe(403);
  });

  it("Should answer 200 if logged in", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should return a profile_id if customer", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer user");
    expect(response.body.role).toBe("customer");
    expect(response.body).toHaveProperty("profile_id");
    expect(response.body.profile_id).toBe(1);
  });

  it("Should return a profile_id and tryber_wp_user_id = 0 if administrator", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer admin");
    expect(response.body.role).toBe("administrator");
    expect(response.body.profile_id).toBe(0);
    expect(response.body.tryber_wp_user_id).toBe(0);
  });

  it("Should return a customer name if customer", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer user");
    expect(response.body.role).toBe("customer");
    expect(response.body).toHaveProperty("name");
    expect(response.body.name).not.toBe("Name Surname");
  });

  it("Should return the user role", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer user");
    expect(response.body.role).toBe("customer");
  });

  it("Should return the user email", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer user");
    expect(response.body.email).toBe("mario.rossi@example.com");
  });

  //Should return the user name and surname of customer
  it("Should return the user name of customer ", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer userWithLimitedPermissions");
    expect(response.body.name).toBe("Paolo Verdi");
  });

  //Should return the unguess wordpress id
  it("Should return the user tryber_wp_user_id", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer user");
    expect(response.body.tryber_wp_user_id).toBe(1);
  });

  //Should return the unguess wordpress id
  it("Should return the user unguess_wp_user_id", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer user");
    expect(response.body.unguess_wp_user_id).toBe(1);
  });

  //Should return the list of enabled features
  it("Should return the user enabled features", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer user");
    expect(response.body.features).toEqual([
      {
        slug: "flying",
        name: "Flying",
      },
    ]);
  });

  //Should return the profile picture
  it("Should return the user picture", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer user");
    expect(response.body.picture).toEqual(
      `https://gravatar.com/avatar/mario.rossi@example.com`
    );
  });

  it("Should return a profile_id and tryber_wp_user_id = 0 if administrator with broken profile", async () => {
    const response = await request(app)
      .get("/users/me")
      .set("authorization", "Bearer admin");
    expect(response.body.role).toBe("administrator");
    expect(response.body.profile_id).toBe(0);
    expect(response.body.tryber_wp_user_id).toBe(0);
  });
});
