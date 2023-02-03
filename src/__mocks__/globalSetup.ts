import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import {
  create as campaignReadStatusesCreate,
  drop as campaignReadStatusesDrop,
} from "@src/features/tables/campaignReadStatuses";

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
  await dbAdapter.create();
  await campaignReadStatusesCreate();
});
afterAll(async () => {
  await dbAdapter.drop();
  await campaignReadStatusesDrop();
});

export {};
