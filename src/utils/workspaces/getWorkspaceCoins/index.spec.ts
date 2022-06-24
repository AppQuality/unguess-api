import { getWorkspaceCoins } from "@src/utils/workspaces";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { ERROR_MESSAGE, fallBackCsmProfile } from "@src/utils/constants";

const customer_1 = {
  id: 1,
  company: "Company",
  company_logo: "logo.png",
  tokens: 100,
};

const customer_2 = {
  id: 2,
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

const coins_2 = {
  ...coins_1,
  id: 2,
  amount: 50,
};

const coins_3 = {
  ...coins_1,
  id: 3,
  customer_id: 2,
};

describe("getWorkspaceCoins", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.create();

        await dbAdapter.add({
          companies: [customer_1, customer_2],
          coins: [coins_1, coins_2, coins_3],
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

  //Should return the arrays of coins for a specific customer
  it("should return the arrays of coins for a specific customer", async () => {
    const coins = await getWorkspaceCoins({ workspaceId: customer_1.id });
    expect(coins).toEqual(
      expect.arrayContaining([
        expect.objectContaining(coins_1),
        expect.objectContaining(coins_2),
      ])
    );
  });

  //Should return an empty array if the customer has no coins or the customer doesn't exist
  it("should return an empty array if the customer has no coins or the customer doesn't exist", async () => {
    const coins = await getWorkspaceCoins({ workspaceId: 999 });
    expect(coins).toEqual([]);
  });
});
