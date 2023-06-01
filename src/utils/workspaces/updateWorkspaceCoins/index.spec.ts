import { updateWorkspaceCoins } from ".";
import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import { DEFAULT_EXPRESS_COST, ERROR_MESSAGE } from "@src/utils/constants";

const customer_1 = {
  id: 1,
};
const customer_2 = {
  id: 2,
};
const customer_3 = {
  id: 3,
};
const customer_4 = {
  id: 4,
};
const customer_5 = {
  id: 5,
};

const coins_1 = {
  id: 1,
  customer_id: customer_1.id,
  amount: 100,
  price: 0,
  created_on: "2022-06-24 12:47:30",
  updated_on: "2022-06-24 12:51:23",
};

const coins_2 = {
  id: 2,
  customer_id: customer_1.id,
  amount: 50,
  price: 0,
  created_on: "2022-05-10 11:34:22",
  updated_on: "2022-06-24 12:51:23",
};

const coins_3 = {
  id: 3,
  customer_id: customer_3.id,
  amount: 0,
  price: 0,
  created_on: "2022-05-10 11:34:22",
  updated_on: "2022-06-24 12:51:23",
};

const coins_4 = {
  id: 4,
  customer_id: customer_3.id,
  amount: 0,
  price: 0,
  created_on: "2022-05-10 11:34:22",
  updated_on: "2022-06-24 12:51:23",
};

const coins_5 = {
  id: 5,
  customer_id: customer_4.id,
  amount: 2,
  price: 0,
  created_on: "2022-05-10 11:34:22",
  updated_on: "2022-06-24 12:51:23",
};

const coins_6 = {
  id: 6,
  customer_id: customer_5.id,
  amount: 3,
  price: 0,
  created_on: "2022-04-10 11:34:22",
  updated_on: "2022-06-24 12:51:23",
};
const coins_7 = {
  id: 7,
  customer_id: customer_5.id,
  amount: 2,
  price: 0,
  created_on: "2022-05-10 11:34:22",
  updated_on: "2022-06-24 12:51:23",
};
const coins_8 = {
  id: 8,
  customer_id: customer_5.id,
  amount: 2,
  price: 0,
  created_on: "2022-05-10 11:34:22",
  updated_on: "2022-06-24 12:51:23",
};

describe("updateWorkspaceCoins", () => {
  beforeEach(async () => {
    await dbAdapter.add({
      coins: [
        coins_1,
        coins_2,
        coins_3,
        coins_4,
        coins_5,
        coins_6,
        coins_7,
        coins_8,
      ],
    });
  });

  afterEach(async () => {
    await dbAdapter.clear();
  });

  // Should return the updated packages and the updated total coins amount
  it("Should update the oldest package available and return the updated package", async () => {
    const packages = await updateWorkspaceCoins({
      workspaceId: customer_1.id,
      cost: DEFAULT_EXPRESS_COST,
    });

    expect(packages).toEqual([
      expect.objectContaining({
        id: coins_2.id,
        amount: coins_2.amount - DEFAULT_EXPRESS_COST,
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

  it("Should return only the updated packages if a single package can't fullfit the amount requested", async () => {
    /*
     * The cost is 100
     * The amount of the first package is 50
     * The amount of the second package is 100
     * The result will be only the second package with the amount of 50
     */
    const packages = await updateWorkspaceCoins({
      workspaceId: customer_1.id,
      cost: 100,
    });

    // Number of packages updated
    expect(packages.length).toEqual(2);

    expect(packages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: coins_1.id,
          amount: 50,
        }),
        expect.objectContaining({
          id: coins_2.id,
          amount: 0,
        }),
      ])
    );
  });

  // Once a package is updated, there should be a transaction for it
  it("Should consume an entire package", async () => {
    const packages = await updateWorkspaceCoins({
      workspaceId: customer_4.id,
      cost: 2,
    });

    expect(packages).toEqual([
      expect.objectContaining({
        id: coins_5.id,
        amount: 0,
      }),
    ]);
  });

  it("Should not update any package", async () => {
    const packages = await updateWorkspaceCoins({
      workspaceId: customer_1.id,
      cost: 0,
    });

    expect(packages).toEqual([]);
  });

  it("Should remove coins from multiple package correctly", async () => {
    const packages = await updateWorkspaceCoins({
      workspaceId: customer_5.id,
      cost: 5,
    });

    expect(packages.length).toBe(2);
  });
});
