import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import WpUgCampaignReadStatus from "@src/features/tables/unguess/WpUgCampaignReadStatus";
import WpAppqCampaignAdditionalFields from "@src/features/tables/tryber/WpAppqCampaignAdditionalFields";
import WpAppqCampaignAdditionalFieldsData from "@src/features/tables/tryber/WpAppqCampaignAdditionalFieldsData";
import { unguess, tryber } from "@src/features/knex";

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
  await WpUgCampaignReadStatus.create();
  await WpAppqCampaignAdditionalFields.create();
  await WpAppqCampaignAdditionalFieldsData.create();
});
afterAll(async () => {
  await dbAdapter.drop();
  await WpUgCampaignReadStatus.drop();
  await WpAppqCampaignAdditionalFields.drop();
  await WpAppqCampaignAdditionalFieldsData.drop();
  await unguess.destroy();
  await tryber.destroy();
});

export {};
