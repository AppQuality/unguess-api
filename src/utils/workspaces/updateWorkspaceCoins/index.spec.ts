import { updateWorkspaceCoins } from ".";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { DEFAULT_EXPRESS_COST, ERROR_MESSAGE } from "@src/utils/constants";

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

const customer_3 = {
  id: 3,
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
  id: 2,
  customer_id: 1,
  amount: 50,
  price: 0,
  created_on: "2022-05-10 11:34:22",
  updated_on: "2022-06-24 12:51:23",
};

const coins_3 = {
  id: 3,
  customer_id: 3,
  amount: 0,
  price: 0,
  created_on: "2022-05-10 11:34:22",
  updated_on: "2022-06-24 12:51:23",
};

const coins_4 = {
  id: 4,
  customer_id: 3,
  amount: 0,
  price: 0,
  created_on: "2022-05-10 11:34:22",
  updated_on: "2022-06-24 12:51:23",
};

describe("updateWorkspaceCoins", () => {
  beforeAll(async () => {
    return new Promise(async (resolve, reject) => {
      try {
        await dbAdapter.add({
          companies: [customer_1, customer_2],
          coins: [coins_1, coins_2, coins_3, coins_4],
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }

      resolve(true);
    });
  });

  // Should return the updated packages and the updated total coins amount
  it("Should update the oldest package available and return the new packages ordered by updated_on", async () => {
    const packages = await updateWorkspaceCoins({
      workspaceId: customer_1.id,
      cost: DEFAULT_EXPRESS_COST,
    });

    expect(packages).toEqual([
      expect.objectContaining({
        id: coins_2.id,
        amount: coins_2.amount - DEFAULT_EXPRESS_COST,
      }),
      expect.objectContaining({
        id: coins_1.id,
      }),
    ]);
  });

  // Should throw an error 400 if no packages are available
  it("Should throw an error 400 if no packages are available", async () => {
    try {
      await updateWorkspaceCoins({
        workspaceId: customer_2.id,
      });
    } catch (error: any) {
      expect(error.code).toBe(400);
      expect(error.message).toBe(ERROR_MESSAGE + " with workspace coins");
    }
  });

  // Should throw an error 400 if no one of the available packages has enough coins amount to pay the cost
  it("Should throw an error 400 if no one of the packages has an amount to pay the cost", async () => {
    try {
      await updateWorkspaceCoins({
        workspaceId: customer_3.id,
      });
    } catch (error: any) {
      expect(error.code).toBe(400);
      expect(error.message).toBe(ERROR_MESSAGE + " with workspace coins");
    }
  });

  // Should throw an error 400 if no one of the available packages has enough coins amount to pay the cost
  it("Should throw an error 400 if all packages total can't pay the cost", async () => {
    // The total is 150 but the cost is 200
    try {
      await updateWorkspaceCoins({
        workspaceId: customer_1.id,
        cost: 200,
      });
    } catch (error: any) {
      expect(error.code).toBe(400);
      expect(error.message).toBe(ERROR_MESSAGE + " with workspace coins");
    }
  });

  // Should return only the remaining packages if the cost is equal to the amount of a package
  it("Should return only the remaining packages if the cost is equal to the amount of a package", async () => {
    /*
     * The cost is 100
     * The amount of the first package is 49 (50 - first transaction at cost 1)
     * The amount of the second package is 100
     * The result will be only the second package with the amount of 50
     */
    const packages = await updateWorkspaceCoins({
      workspaceId: customer_1.id,
      cost: 100,
    });

    expect(packages).toEqual([
      expect.objectContaining({
        id: coins_1.id,
        amount: 49,
      }),
    ]);
  });

  // Once a package is updated, there should be a transaction for it
  it("Should create a transaction for the package", async () => {
    const packages = await updateWorkspaceCoins({
      workspaceId: customer_1.id,
      cost: DEFAULT_EXPRESS_COST, // Total amount is now 48
    });

    expect(packages).toEqual([
      expect.objectContaining({
        id: coins_1.id,
        amount: 48,
      }),
    ]);
  });
});
