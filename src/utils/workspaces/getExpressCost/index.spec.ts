import { getExpressCost } from ".";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import {
  DEFAULT_EXPRESS_COST,
  EXPERIENTIAL_CAMPAIGN_TYPE_ID,
} from "@src/utils/constants";

const customer_1 = {
  id: 1,
  company: "Company",
  company_logo: "logo.png",
  tokens: 100,
};

const coins_1 = {
  id: 1,
  customer_id: 1,
  amount: 100,
  price: 0,
  created_on: "2022-06-24 12:47:30",
  updated_on: "2022-06-24 12:51:23",
};

const campaign_1 = {
  id: 42,
  start_date: "2017-07-20 00:00:00",
  end_date: "2017-07-20 00:00:00",
  close_date: "2017-07-20 00:00:00",
  title: "Campagnetta Provetta",
  customer_title: "titolo",
  description: "Descrizione della campagnazione",
  status_id: 1,
  is_public: 0,
  campaign_type_id: 1,
  project_id: 1,
  customer_id: 1,
  campaign_type: 0,
};

const user_to_customer_1 = {
  wp_user_id: 1,
  customer_id: 1,
};

const customer_profile_1 = {
  id: 1,
  wp_user_id: 1,
  name: "Customer",
  surname: "Customer",
  email: "customer@unguess.io",
};

const project_1 = {
  id: 1,
  display_name: "Project",
  customer_id: 1,
  last_edit: "2017-07-20 00:00:00",
};

const campaign_type_1 = {
  id: 1,
  name: "Campaign Type",
  type: EXPERIENTIAL_CAMPAIGN_TYPE_ID,
};

const express_1 = {
  id: 1,
  slug: "express-slug",
  cost: DEFAULT_EXPRESS_COST,
};

describe("getExpressCost", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.add({
          campaigns: [campaign_1],
          profiles: [customer_profile_1],
          projects: [project_1],
          campaignTypes: [campaign_type_1],
          companies: [customer_1],
          userToCustomers: [user_to_customer_1],
          coins: [coins_1],
          express: [express_1],
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  // Should return a cost giving the express' slug
  it("Should return a cost giving the express' slug", async () => {
    const expressCost = await getExpressCost({ slug: "express-slug" });
    expect(expressCost).toBe(express_1.cost);
  });

  // Should return false if the slug is not found
  it("Should return false if the slug is not found", async () => {
    const expressCost = await getExpressCost({
      slug: "express-slug-not-found",
    });
    expect(expressCost).toBe(false);
  });
});
