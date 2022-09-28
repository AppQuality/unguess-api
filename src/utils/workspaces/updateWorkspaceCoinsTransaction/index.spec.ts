import { updateWorkspaceCoinsTransaction } from ".";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import {
  DEFAULT_EXPRESS_COST,
  ERROR_MESSAGE,
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

const user_1 = {
  id: 1,
  user_login: "customer@unguess.io",
  user_pass: "customer@unguess.io",
  email: "customer@unguess.io",
  role: "customer",
  tryber_wp_user_id: 1,
  unguess_wp_user_id: 456,
  profile_id: 1,
  workspaces: [],
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

describe("updateWorkspaceCoinsTransaction", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.create();

        await dbAdapter.add({
          campaigns: [campaign_1],
          profiles: [customer_profile_1],
          projects: [project_1],
          campaignTypes: [campaign_type_1],
          companies: [customer_1],
          userToCustomers: [user_to_customer_1],
          coins: [coins_1],
        });
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
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  // Should return true if the transaction was successful
  it("Should return true if the transaction was successful", async () => {
    const transaction = await updateWorkspaceCoinsTransaction({
      workspaceId: customer_1.id,
      user: user_1,
      quantity: DEFAULT_EXPRESS_COST,
      campaignId: campaign_1.id,
      coinsPackageId: coins_1.id,
    });

    expect(transaction).toEqual(
      expect.objectContaining({
        customer_id: customer_1.id,
        profile_id: customer_profile_1.id,
        quantity: DEFAULT_EXPRESS_COST,
        campaign_id: campaign_1.id,
        coins_package_id: coins_1.id,
      })
    );
  });

  // Should throw an error if parameters are wrong
  it("Should throw an error if parameters are wrong", async () => {
    try {
      await updateWorkspaceCoinsTransaction({
        workspaceId: customer_1.id,
        user: user_1,
        quantity: DEFAULT_EXPRESS_COST,
        campaignId: -1, // Wrong campaign id
        coinsPackageId: coins_1.id,
      });
    } catch (error) {
      expect(error).toEqual(
        expect.objectContaining({
          message: ERROR_MESSAGE + " with coins transaction",
        })
      );
    }
  });
});
