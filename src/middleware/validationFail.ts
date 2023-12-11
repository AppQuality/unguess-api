import * as Sentry from "@sentry/node";
import { Context } from "openapi-backend";

export default (c: Context, req: OpenapiRequest, res: OpenapiResponse) => {
  res.skip_post_response_handler = true;
  Sentry.addBreadcrumb({
    category: "Request Validation Failed",
    message: `Validation failed for endpoint ${req.path} ${req.query}`,
    level: "warning",
  });
  Sentry.addBreadcrumb({
    category: "Invalid Data",
    message: JSON.stringify(c.validation.errors),
    level: "info",
  });
  Sentry.captureMessage(
    `Request Validation error on ${req.method} ${req.path} ${req.query}`,
    "warning"
  );
  return res.status(400).json({
    err: c.validation.errors,
  });
};
