import isGracePeriodPassed from "./isGracePeriodPassed";
import uniqueBugsRead from "@src/__mocks__/database/customer_unique_bug_read";

describe("isGracePeriodPassed", () => {
  beforeAll(() => {
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
    const now = new Date();
    const formatDateTime = (t: Date | number) => new Date(t).getTime();

    uniqueBugsRead.insert({
      campaign_id: 1,
      wp_user_id: 1,
      bugs_read: 0,
      update_time: formatDateTime(yesterday),
    });
    uniqueBugsRead.insert({
      campaign_id: 2,
      wp_user_id: 1,
      bugs_read: 0,
      update_time: formatDateTime(now),
    });
  });
  it("Should return true if the current campaign was updated at least one minute ago", async () => {
    const result = await isGracePeriodPassed({ campaignId: 1, userId: 1 });
    expect(result).toBe(true);
  });
  it("Should return false if the current campaign was updated less than one minute ago", async () => {
    const result = await isGracePeriodPassed({ campaignId: 2, userId: 1 });
    expect(result).toBe(false);
  });
  it("Should return true if the current campaign was never updated", async () => {
    const result = await isGracePeriodPassed({ campaignId: 3, userId: 1 });
    expect(result).toBe(true);
  });
});
