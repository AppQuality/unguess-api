import crypto from "crypto";

export const randomString = (size = 21) => {
  return crypto.randomBytes(size).toString("base64").slice(0, size);
};
