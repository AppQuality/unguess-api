import { isInternal } from ".";

describe("isInternal user", () => {
  it("should return false if the email is not valid", async () => {
    const res = isInternal("invalidemail");
    expect(res).toEqual(false);
  });

  it("should return false if the email is not an accepted one", async () => {
    const res = isInternal("invalid@asd.com");
    expect(res).toEqual(false);
  });

  it("should return true if the email is an accepted one", async () => {
    const tryber = isInternal("good@tryber.me");
    const unguess = isInternal("good@unguess.io");
    const appq = isInternal("good@app-quality.com");

    expect(tryber).toEqual(true);
    expect(unguess).toEqual(true);
    expect(appq).toEqual(true);
  });
});
