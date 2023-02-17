import { adapter as dbAdapter } from "@src/__mocks__/database/companyAdapter";
import WpUgCampaignReadStatus from "@src/features/tables/unguess/WpUgCampaignReadStatus";
import WpAppqCampaignAdditionalFields from "@src/features/tables/tryber/WpAppqCampaignAdditionalFields";
import WpAppqCampaignAdditionalFieldsData from "@src/features/tables/tryber/WpAppqCampaignAdditionalFieldsData";
import { unguess, tryber } from "@src/features/knex";
import {
  create as tryberCreate,
  drop as tryberDrop,
} from "@src/features/tables/tryber";
import {
  create as unguessCreate,
  drop as unguessDrop,
} from "@src/features/tables/unguess";

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
  await tryberCreate();
  await unguessCreate();
});
afterAll(async () => {
  await dbAdapter.drop();
  await tryberDrop();
  await unguessDrop();
  await unguess.destroy();
  await tryber.destroy();
});

export {};
