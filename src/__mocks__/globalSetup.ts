import { tryber, unguess } from "@src/features/database";
import campaignOutputs from "../__mocks__/database/cp_outputs_view";

expect.extend({
  toBeNow(received: number, precision: number = 0) {
    const current = new Date(`${received} GMT+0`).getTime() / 10000;
    const now = new Date().getTime() / 10000;
    const message = () =>
      `expected ${received} to be now : the difference is ${current - now}`;
    return { message, pass: Math.abs(current - now) < precision };
  },
});

beforeAll(async () => {
  // await dbAdapter.create();
  await campaignOutputs.mock();
  await tryber.create();
  await unguess.create();
});
afterAll(async () => {
  // await dbAdapter.drop();
  await campaignOutputs.dropMock();
  await unguess.drop();
  await unguess.destroy();
  await tryber.drop();
  await tryber.destroy();
});

export {};
