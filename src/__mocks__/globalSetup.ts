import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";

beforeAll(async () => {
  await dbAdapter.create();
});
afterAll(async () => {
  await dbAdapter.drop();
});

export {};
