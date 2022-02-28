import wpAuthProvider from "@appquality/wp-auth";
import jwt from "jsonwebtoken";
import { Context } from "openapi-backend";

import config from "../config";
import authenticate from "../features/wp/authenticate";
import getUserById from "../features/wp/getUserById";

const wpAuth = wpAuthProvider.create({
  wpurl: config.CROWD_URL,
  logged_in_key: config.wp.logged_in_key,
  logged_in_salt: config.wp.logged_in_salt,
  mysql_host: config.db.host,
  mysql_user: config.db.user,
  mysql_port: config.db.port,
  mysql_pass: config.db.password,
  mysql_db: config.db.database,
  wp_table_prefix: "wp_",
  checkKnownHashes: false,
});

const checkCookies = (req: OpenapiRequest): Promise<UserType | Error> => {
  return new Promise((resolve, reject) => {
    return wpAuth
      .checkAuth(req)
      .on("auth", async function (authIsValid: boolean, userId: number) {
        if (authIsValid) {
          const userData = await getUserById(userId);
          const user = await authenticate(userData);
          return resolve(user);
        }
        return reject(new Error("Missing authorization header"));
      });
  });
};

export default async (
  c: Context,
  req: OpenapiRequest,
  res: OpenapiResponse
) => {
  let authHeader = c.request.headers["authorization"];
  if (Array.isArray(authHeader)) {
    authHeader = authHeader.join(" ");
  }
  if (!authHeader) {
    const user = await checkCookies(req);
    if (user instanceof Error) {
      throw user;
    }
    req.user = user;
    return user;
  }
  const token = authHeader.replace("Bearer ", "");
  const decoded = jwt.verify(token, config.jwt.secret);
  req.user = decoded as UserType;
  return req.user;
};
