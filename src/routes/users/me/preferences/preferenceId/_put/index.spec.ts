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

const default_preference_4 = {
  id: 36,
  name: "test_2",
  description: "test_2",
  is_active: 0,
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

describe("PUT /users/me/preferences/{prefid}", () => {
  beforeAll(async () => {
    await unguess.tables.UserPreferences.do().insert([
      user_preference_1,
      user_preference_2,
    ]);
    await unguess.tables.Preferences.do().insert([
      default_preference_1,
      default_preference_2,
      default_preference_3,
      default_preference_4,
    ]);
  });
  afterAll(async () => {
    await unguess.tables.UserPreferences.do().delete();
    await unguess.tables.Preferences.do().delete();
  });
  it("Should answer 403 if not logged in", async () => {
    const response = await request(app)
      .put(`/users/me/preferences/${default_preference_1.id}`)
      .send({ value: 0 });
    expect(response.status).toBe(403);
  });

  it("Should answer 200 if logged in", async () => {
    const response = await request(app)
      .put(`/users/me/preferences/${default_preference_1.id}`)
      .set("authorization", "Bearer user")
      .send({ value: 0 });
    expect(response.status).toBe(200);
  });

  it("Should answer 200 with the changed preference if the user has the active preference already set", async () => {
    const response = await request(app)
      .put(`/users/me/preferences/${default_preference_1.id}`)
      .set("authorization", "Bearer user")
      .send({ value: 0 });
    expect(response.status).toBe(200);
    expect(response.body.value).toBe(0);
  });

  it("Should return the newly assigned active preference if the user does not have the preference assigned", async () => {
    const response = await request(app)
      .put(`/users/me/preferences/${default_preference_3.id}`)
      .set("authorization", "Bearer user")
      .send({ value: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      preference_id: default_preference_3.id,
      name: default_preference_3.name,
      value: 1,
    });
  });

  it("Should return an error if the user is trying to assign an non active preference ", async () => {
    const response = await request(app)
      .put(`/users/me/preferences/${default_preference_4.id}`)
      .set("authorization", "Bearer user")
      .send({ value: 1 });
    expect(response.status).toBe(400);
  });

  it("Should return an error if the user sends an empty body ", async () => {
    const response = await request(app)
      .put(`/users/me/preferences/${default_preference_4.id}`)
      .set("authorization", "Bearer user")
      .send();
    expect(response.status).toBe(400);
  });

  it("Should return an error if the preference id is not valid ", async () => {
    const response = await request(app)
      .put(`/users/me/preferences/999`)
      .set("authorization", "Bearer user")
      .send({ value: 1 });
    expect(response.status).toBe(400);
  });
});
