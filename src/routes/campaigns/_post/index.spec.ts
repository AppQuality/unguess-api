import app from "@src/app";
import request from "supertest";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import {
  table as platformTable,
  data as platformData,
} from "@src/__mocks__/database/platforms";
import {
  DT_DESKTOP,
  DT_SMARTPHONE,
  fallBackCsmProfile,
} from "@src/utils/constants";

const customer_1 = {
  id: 1,
  company: "Company 1",
  company_logo: "logo1.png",
  tokens: 100,
};

const AndroidPhone = {
  id: 1,
  name: "Android",
  form_factor: DT_SMARTPHONE,
};

const AndroidPhoneBody = {
  id: 1,
  name: "Android",
  deviceType: DT_SMARTPHONE,
};

const WindowsPC = {
  id: 8,
  name: "Windows",
  form_factor: DT_DESKTOP,
};

const WindowsPCBody = {
  id: 8,
  name: "Windows",
  deviceType: DT_DESKTOP,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 1,
};

const project_1 = {
  id: 1,
  display_name: "Project 1",
  customer_id: 1,
};

const project_2 = {
  id: 2,
  display_name: "Project 2",
  customer_id: 1,
};

const user_to_project_1 = {
  wp_user_id: 1,
  project_id: 1,
};

const user_to_project_2 = {
  wp_user_id: 2,
  project_id: 2,
};

const campaign_request_1 = {
  title: "Campaign 1 title",
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  customer_title: "Campaign 1 customer title",
  is_public: 1,
  campaign_type_id: 1,
  project_id: 1,
  pm_id: fallBackCsmProfile.id,
  customer_id: 1,
};

const campaign_1 = {
  id: 1,
  start_date: "2017-07-20 10:00:00",
  end_date: "2017-07-20 10:00:00",
  close_date: "2017-07-20 10:00:00",
  title: "Campaign 1 title",
  customer_title: "Campaign 1 customer title",
  status_id: 1,
  is_public: 1,
  campaign_type_id: 1,
  campaign_type: -1,
  project_id: 1,
};

const campaign_type_1 = {
  id: 1,
  name: "Functional Testing (Bug Hunting)",
  type: 0,
};

const coins_1 = {
  id: 1,
  amount: 10,
  customer_id: 1,
};

describe("POST /campaigns", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.create();
        await platformTable.create();

        await dbAdapter.add({
          companies: [customer_1],
          userToCustomers: [user_to_customer_1],
          projects: [project_1, project_2],
          userToProjects: [user_to_project_1, user_to_project_2],
          campaigns: [campaign_1],
          campaignTypes: [campaign_type_1],
          coins: [coins_1],
        });

        await platformData.addItem(AndroidPhone);
        await platformData.addItem(WindowsPC);
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  afterAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.drop();
        await platformTable.drop();
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  it("Should answer 403 if not logged in", async () => {
    const response = await request(app)
      .post("/campaigns")
      .send(campaign_request_1);
    expect(response.status).toBe(403);
  });

  it("Should answer 400 if the request body doesn't have campaign request schema required fields", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer customer")
      .send({
        start_date: "2020-01-01",
        end_date: "2020-01-01",
        close_date: "2020-01-01",
        title: "Campaign 1 title",
        customer_title: "Campaign 1 customer title",
      });
    expect(response.status).toBe(400);
  });

  it("Should answer 403 if the user is not part of the project", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer customer")
      .send({
        ...campaign_request_1,
        platforms: [AndroidPhoneBody, WindowsPCBody],
        project_id: 2,
      });
    expect(response.status).toBe(403);
  });

  it("Should answer 403 if the project doesn't exist", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer customer")
      .send({
        ...campaign_request_1,
        platforms: [AndroidPhoneBody, WindowsPCBody],
        project_id: 3,
      });
    expect(response.status).toBe(403);
  });

  it("Should answer 200 with a campaign object", async () => {
    const response = await request(app)
      .post("/campaigns")
      .set("Authorization", "Bearer customer")
      .send({
        ...campaign_request_1,
        platforms: [AndroidPhoneBody, WindowsPCBody],
      });
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: 2,
      title: campaign_1.title,
      customer_title: campaign_1.customer_title,
      is_public: campaign_1.is_public,
      start_date: campaign_1.start_date,
      end_date: campaign_1.end_date,
      close_date: campaign_1.close_date,
      bug_form: campaign_1.campaign_type,
      status: {
        id: campaign_1.status_id,
        name: "running",
      },
      type: {
        id: campaign_1.campaign_type_id,
        name: campaign_type_1.name,
      },
      family: {
        id: campaign_type_1.type,
        name: "Functional",
      },
      project: {
        id: project_1.id,
        name: project_1.display_name,
      },
    });
  });
});
