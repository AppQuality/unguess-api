import app from "@src/app";
import { unguess } from "@src/features/database";
import request from "supertest";

const default_preference_1 = {
  id: 11,
  name: "notification_enabled",
  description: "notification_enabled",
  is_active: 1,
  default_value: 1,
};

const default_preference_2 = {
  id: 16,
  name: "language",
  description: "language",
  is_active: 0,
  default_value: 1,
};
const default_preference_3 = {
  id: 5,
  name: "test",
  description: "test",
  is_active: 1,
  default_value: 1,
};

const user_preference_1 = {
  id: 14,
  profile_id: 1,
  preference_id: default_preference_1.id,
  value: 1,
  creation_date: "2021-08-10 00:00:00",
  last_update: "2021-08-10 00:00:00",
  change_author_id: 1,
};
const user_preference_2 = {
  id: 19,
  profile_id: 1,
  preference_id: default_preference_2.id,
  value: 1,
  creation_date: "2021-08-10 00:00:00",
  last_update: "2021-08-10 00:00:00",
  change_author_id: 1,
};

describe("GET /users/me/preferences", () => {
  beforeAll(async () => {
    await unguess.tables.UserPreferences.do().insert([
      user_preference_1,
      user_preference_2,
    ]);
    await unguess.tables.Preferences.do().insert([
      default_preference_1,
      default_preference_2,
      default_preference_3,
    ]);
  });
  afterAll(async () => {
    await unguess.tables.UserPreferences.do().delete();
    await unguess.tables.Preferences.do().delete();
  });
  it("Should answer 403 if not logged in", async () => {
    const response = await request(app).get("/users/me/preferences");
    expect(response.status).toBe(403);
  });

  it("Should answer 200 if logged in", async () => {
    const response = await request(app)
      .get("/users/me/preferences")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
  });

  it("Should answer 200 and a list of active user preferences", async () => {
    const response = await request(app)
      .get("/users/me/preferences")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        items: [
          {
            preference_id: default_preference_3.id,
            name: default_preference_3.name,
            value: default_preference_3.default_value,
          },
          {
            preference_id: default_preference_1.id,
            name: default_preference_1.name,
            value: user_preference_1.value,
          },
        ],
      })
    );
  });

  it("Should return a default active preference if the user does not have the preference assigned", async () => {
    const response = await request(app)
      .get("/users/me/preferences")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        items: [
          {
            preference_id: default_preference_3.id,
            name: default_preference_3.name,
            value: default_preference_3.default_value,
          },
          {
            preference_id: default_preference_1.id,
            name: default_preference_1.name,
            value: user_preference_1.value,
          },
        ],
      })
    );
  });
});

describe("GET /users/me/preferences", () => {
  beforeAll(async () => {
    await unguess.tables.UserPreferences.do().delete();
    await unguess.tables.Preferences.do().delete();
  });
  it("Should return an empty array if the user has no active preferences and there are no active default preferences", async () => {
    const response = await request(app)
      .get("/users/me/preferences")
      .set("authorization", "Bearer user");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ items: [] });
  });
});
