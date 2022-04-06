import getProject from ".";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";

jest.mock("@src/features/db");
jest.mock("@appquality/wp-auth");

const project_1 = {
  id: 1,
  display_name: "Projettino unoh",
  customer_id: 1,
};

const project_2 = {
  id: 2,
  display_name: "Projettino dueh",
  customer_id: 1,
};

const user_to_project_1 = {
  wp_user_id: 1,
  project_id: 1,
};

const user_to_project_2 = {
  wp_user_id: 1,
  project_id: 2,
};

const campaign_1 = {
  id: 1,
  start_date: "2020-01-01",
  end_date: "2020-01-02",
  close_date: "2020-01-03",
  title: "Campagna 1",
  customer_title: "Campagna 1",
  description: "Descrizione campagna 1",
  status_id: 1,
  is_public: 1,
  campaign_type_id: 1,
  project_id: 1,
  customer_id: 1,
};

describe("getProject", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.create();

        await dbAdapter.add({
          campaigns: [campaign_1],
          projects: [project_1, project_2],
          userToProjects: [user_to_project_1, user_to_project_2],
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
        console.log(error);
        reject(error);
      }

      resolve(true);
    });
  });

  it("Should have projectId parameter", async () => {
    try {
      await getProject(0);
      fail("Should throw error");
    } catch (error) {
      expect((error as OpenapiError).message).toBe("Bad request");
    }
  });

  it("Should throw 'No project found' error on no results", async () => {
    try {
      await getProject(9999);
      fail("Should throw error");
    } catch (error) {
      expect((error as OpenapiError).message).toBe("No project found");
    }
  });

  it("Should return a project", async () => {
    try {
      let project = await getProject(project_1.id);
      expect(JSON.stringify(project)).toBe(
        JSON.stringify({
          id: project_1.id,
          name: project_1.display_name,
          campaigns_count: 1,
        })
      );
    } catch (error) {
      console.error(error);
    }
  });
});
