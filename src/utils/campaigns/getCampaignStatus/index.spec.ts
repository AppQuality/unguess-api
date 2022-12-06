import { getCampaignStatus } from "./index";

describe("getCampaignStatus", () => {
  // Should return completed if status_id is 2, regardless of start_date
  it("should return completed if status_id is 2", () => {
    const campaign = {
      status_id: 2,
      start_date: "2021-01-01",
    };
    expect(getCampaignStatus(campaign)).toBe("completed");
  });

  // Should return incoming if status_id is 1 and start_date is in the future
  it("should return incoming if status_id is 1 and start_date is in the future", () => {
    const campaign = {
      status_id: 1,
      start_date: "2030-01-01",
    };
    expect(getCampaignStatus(campaign)).toBe("incoming");
  });

  // Should return running if status_id is 1 and start_date is in the past
  it("should return running if status_id is 1 and start_date is in the past", () => {
    const campaign = {
      status_id: 1,
      start_date: "2010-01-01",
    };
    expect(getCampaignStatus(campaign)).toBe("running");
  });

  // Should return running if status_id is not 1 or 2
  it("should return running if status_id is not 1 or 2", () => {
    const campaign = {
      status_id: 3,
      start_date: "2010-01-01",
    };
    expect(getCampaignStatus(campaign)).toBe("running");
  });
});
