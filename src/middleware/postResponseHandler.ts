import { Context } from "openapi-backend";
import process from "process";

export default (c: Context, req: OpenapiRequest, res: OpenapiResponse) => {
  if (!res.skip_post_response_handler) {
    const valid = c.api.validateResponse(
      c.response,
      c.operation,
      res.status_code
    );

    if (valid.errors) {
      if (process.env && process.env.DEBUG && process.env.DEBUG === "1") {
        console.log(c.response);
        console.log(valid.errors);
      }
      // response validation failed
      return res.status(502).json({
        status: 502,
        err: valid.errors,
      });
    }
    return res.status(res.status_code).json(c.response);
  }
};
