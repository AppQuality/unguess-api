import AWS from "aws-sdk";
import stream from "stream";

import upload from ".";

jest.mock("aws-sdk", () => {
  let instance = {
    upload: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };
  return { S3: jest.fn(() => instance) };
});
const mockedS3: any = new AWS.S3();
describe("Upload to S3", () => {
  beforeAll(() => {
    mockedS3.promise.mockReturnValueOnce({
      Bucket: "TestBucketName",
      location: "https://testbucketname.s3.amazonaws.com/test.jpg",
    });
  });
  it("should upload a file to S3 with correct mimetype", async () => {
    const fileStream = stream.Readable.from(Buffer.from("pippo").toString());

    const file: Media = {
      name: "test.txt",
      mimeType: "text/plain",
      size: 12,
      stream: fileStream,
      tmpPath: "",
    };

    await upload({
      bucket: "",
      key: "",
      file: file,
    });
    expect(mockedS3.upload).toBeCalledWith({
      Body: expect.anything(),
      Bucket: "",
      Key: "",
      ContentType: "text/plain",
    });
  });
});
