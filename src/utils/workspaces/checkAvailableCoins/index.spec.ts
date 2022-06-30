import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { checkAvailableCoins } from ".";

const customer_user_1 = {
  id: 1,
  user_login: "customer1@unguess.io",
  user_pass: "password",
  email: "customer1@unguess.io",
  role: "customer",
  tryber_wp_user_id: 1,
  unguess_wp_user_id: 1,
  profile_id: 1,
  workspaces: {},
};

const customer_1 = {
  id: 1,
  company: "Company 1",
  company_logo: "logo1.png",
  tokens: 100,
};

const customer_2 = {
  id: 2,
  company: "Company 2",
  company_logo: "logo2.png",
  tokens: 100,
};

const customer_3 = {
  id: 3,
  company: "Company 3",
  company_logo: "logo3.png",
  tokens: 100,
};

const user_to_customer_1 = {
  wp_user_id: customer_user_1.id,
  customer_id: customer_1.id,
};

const user_to_customer_2 = {
  wp_user_id: customer_user_1.id,
  customer_id: customer_2.id,
};

const user_to_customer_3 = {
  wp_user_id: customer_user_1.id,
  customer_id: customer_3.id,
};

const coins_package_1 = {
  customer_id: customer_1.id,
  amount: 1,
};

const coins_package_2 = {
  customer_id: customer_3.id,
  amount: 2,
};

describe("checkAvailableCoins", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.create();

        await dbAdapter.add({
          companies: [customer_1, customer_2, customer_3],
          userToCustomers: [
            user_to_customer_1,
            user_to_customer_2,
            user_to_customer_3,
          ],
          coins: [coins_package_1, coins_package_2],
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

  it("Should return true if the coins amount is greater or equal than 1", async () => {
    const response = checkAvailableCoins({ coins: coins_package_1.amount });

    expect(response).toBe(true);
  });

  it("Should return false if the coin amount is 0", async () => {
    const response = await checkAvailableCoins({
      coins: 0,
    });

    expect(response).toBe(false);
  });

  it("Should return false if the coins amount is 1 and the price is 2", async () => {
    const response = await checkAvailableCoins({
      coins: coins_package_1.amount,
      cost: 2,
    });

    expect(response).toBe(false);
  });

  it("Should return true if the amount is 2 and the price is 2", async () => {
    const response = await checkAvailableCoins({
      coins: coins_package_2.amount,
      cost: 2,
    });

    expect(response).toBe(true);
  });
});
