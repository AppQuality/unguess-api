import "jest";
import { decomposeS3Url } from ".";

describe("Decompose s3 url", () => {
  it("Should return bucket and key", () => {
    const url =
      "https://s3.eu-west-1.amazonaws.com/media.bucket/media/T11205/txt 1653662342424.json";
    const { bucket, key } = decomposeS3Url(url);
    expect(bucket).toBe("media.bucket");
    expect(key).toBe("media/T11205/txt 1653662342424.json");
  });
});
