import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import defaultUsers from "@src/__mocks__/database/seed/users.json";
import getUserFeatures from ".";

const feature1 = {
  id: 1,
  slug: "flying",
  display_name: "Flying",
};

const feature2 = {
  id: 2,
  slug: "mind-control",
  display_name: "Mind control",
};

describe("wp/getUserFeatures", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.create();
        await dbAdapter.add({
          unguess_users: defaultUsers,
          features: [feature1, feature2],
          userToFeatures: [
            {
              unguess_wp_user_id: 1,
              feature_id: 1,
            },
            {
              unguess_wp_user_id: 1,
              feature_id: 2,
            },
            {
              unguess_wp_user_id: 2,
              feature_id: 2,
            },
          ],
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

  it("Should return an empty array if users doesn't exits or has no enabled features", async () => {
    const response = await getUserFeatures(999);
    expect(response).toEqual([]);
  });

  it("Should return all features if the users is #1", async () => {
    const response = await getUserFeatures(1);
    expect(response).toHaveLength(2);
    expect(response).toEqual([
      {
        slug: feature1.slug,
        name: feature1.display_name,
      },
      {
        slug: feature2.slug,
        name: feature2.display_name,
      },
    ]);
  });

  it("Should return just 'mind control' if the users is #2", async () => {
    const response = await getUserFeatures(2);
    expect(response).toHaveLength(1);
    expect(response).toEqual([
      {
        slug: feature2.slug,
        name: feature2.display_name,
      },
    ]);
  });
});
