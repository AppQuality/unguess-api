import AWS from "aws-sdk";
import fs from "fs";

async function getSignedCookie({ url }: { url: string }) {
  const privateKey = fs.readFileSync("./keys/cloudfront.pem");
  let signer = new AWS.CloudFront.Signer(
    process.env.CLOUDFRONT_KEY_ID || "",
    privateKey.toString()
  );
  const today = new Date();
  let tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  let expiry = tomorrow.getTime();
  var options = {
    url,
    policy: JSON.stringify({
      Statement: [
        {
          Resource: url,
          Condition: {
            DateLessThan: { "AWS:EpochTime": expiry },
          },
        },
      ],
    }),
  };
  return new Promise<AWS.CloudFront.Signer.CustomPolicy>((resolve, reject) => {
    signer.getSignedCookie(options, function (err, cookie) {
      if (err) {
        reject(err);
        return;
      }
      resolve(cookie);
    });
  });
}

export { getSignedCookie };
