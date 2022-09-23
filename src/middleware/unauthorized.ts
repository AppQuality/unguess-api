import { Context } from "openapi-backend";
import process from "process";

export default async (c: Context, req: Request, res: OpenapiResponse) => {
  res.skip_post_response_handler = true;
  if (process.env && process.env.DEBUG && process.env.DEBUG === "1") {
    console.log(c.security);
  }
  return res.status(403).json({
    err: "unauthorized",
  });
};
