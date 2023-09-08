import { S3 } from "aws-sdk";
import { parse } from "url";

const decomposeS3Url = (url: string): { bucket: string; key: string } => {
  const { path } = parse(url);
  const decodedPath = decodeURI(path || "");
  const [, bucket, key] = decodedPath.match(/\/(.*?)\/(.*?)\/?$/) || [];
  return { bucket, key };
};

const fileExist = async ({ url }: { url: string }) => {
  const { bucket, key } = decomposeS3Url(url);
  const awsCredentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
  const s3 = new S3(awsCredentials);
  try {
    await s3.headObject({ Bucket: bucket, Key: key }).promise();
    return true;
  } catch (err) {
    return false;
  }
};
export default fileExist;
