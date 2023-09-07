import fileExists from ".";
import AWS from "aws-sdk";

// Use fake timers to allow mocking s3
jest.useFakeTimers();
beforeAll(() => {
  const s3 = new AWS.S3();

  s3.headObject({ Bucket: "", Key: "" }, () => {});

  // @ts-ignore
  AWS.S3 = jest.fn().mockImplementation(() => {
    return {
      headObject(params: { Bucket: string; Key: string }) {
        return {
          promise: () => {
            if (params.Bucket !== "bucket") throw new Error("Invalid bucket");
            if (params.Key === "not-existing")
              throw new Error("File not existing");
            return true;
          },
        };
      },
    };
  });
});

describe("fileExists", () => {
  it("should return true if file exists", async () => {
    const result = await fileExists({
      url: "https://s3.eu-west-1.amazonaws.com/bucket/existing",
    });
    expect(result).toBe(true);
  });
  it("should return false if file does not exist", async () => {
    const result = await fileExists({
      url: "https://s3.eu-west-1.amazonaws.com/bucket/not-existing",
    });
    expect(result).toBe(false);
  });
});
